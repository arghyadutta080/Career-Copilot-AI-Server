# Career Copilot Backend Server - Architecture & API Guide

Welcome to the backend reference guide and documentation for the **Career Copilot Server**. This service runs an Express server in TypeScript, exposing GraphQL endpoints (via Apollo Server), traditional REST APIs, and a Server-Sent Events (SSE) streaming engine. It leverages LangChain and Gemini (`gemini-3.5-flash` & `gemini-3.1-flash-lite`) to perform intelligent resume parsing, ATS scoring, skill-gap analysis, optimization proposals, cover letter design, customized interview prep questions, career roadmap generation, and on-demand streaming of interview answers.

---

## Table of Contents
1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [Database Models (Mongoose Schemas)](#database-models-mongoose-schemas)
3. [Core Workflows](#core-workflows)
4. [API Docs: REST API Reference](#api-docs-rest-api-reference)
5. [API Docs: Server-Sent Events (SSE)](#api-docs-server-sent-events-sse)
6. [API Docs: GraphQL Schema & Resolvers](#api-docs-graphql-schema--resolvers)
7. [Local Development & Setup](#local-development--setup)

---

## Tech Stack & Architecture

### Stack Summary
- **Runtime & Language**: Node.js, TypeScript
- **Web framework**: Express (v5)
- **GraphQL Engine**: Apollo Server (v5) + `@as-integrations/express5`
- **Database**: MongoDB + Mongoose ODM
- **AI / LLM Orchestration**: LangChain (`@langchain/google-genai`), targeting `gemini-3.1-pro-preview` for deep analysis and `gemini-3.1-flash-lite` for high-speed streaming tasks.
- **File Upload / Storage**: Multer (Memory Storage) & Cloudinary SDK
- **Document Parsers**: `pdf-parse` & `mammoth` (DOCX content extraction)
- **Token Authorization**: Custom JWT middleware

### System Architecture Diagram

The diagram below details the components of the backend server and how data flows through authentication, parsing, and pipeline analysis:

```mermaid
graph TD
    Client[Client App] <-->|HTTP / REST| Express[Express Server]
    Client <-->|HTTP POST/GET /graphql| Apollo[Apollo Server]
    Client <-->|SSE Stream| SSE[SSE Manager]
    
    subgraph Express Router & Middleware
        Express -->|Auth JWT Middleware| Auth[Auth Guard]
        Express -->|Quota & Usage Middleware| Quota[Usage Tracker]
        Express -->|Multer Memory| Upload[Upload Route]
        Express -->|SSE Route| SSERoute[Stream Endpoint]
    end

    subgraph Core Services
        Upload -->|Text Extractor| Parsers[pdf-parse / mammoth]
        Parsers -->|Raw Text| StructureResume[Parser Service]
        StructureResume -->|Gemini Structure| Gemini[Gemini LLM Engine]
        Upload -->|Binary| Cloudinary[Cloudinary Cloud Storage]
        
        Apollo -->|Triggers Pipeline| Pipeline[Analysis Pipeline]
        Pipeline -->|Sequential Run| ToolRunner[Agent Tools ATS, SkillGap, Optimizer, CoverLetter]
        ToolRunner -->|LangChain Structured| Gemini
    end

    subgraph Data Layer
        StructureResume & Cloudinary -->|Store Resume| DB[(MongoDB)]
        ToolRunner -->|Store Tool Results & Status| DB
        Quota -->|Update User Usage| DB
        SSERoute -->|Read status| DB
    end

    ToolRunner -->|Status Updates| SSE
    SSE -->|Stream Event| Client
```

---

## Database Models (Mongoose Schemas)

The codebase defines five primary collections. Click the links below to view their source file definitions:

### 1. User Schema ([User.ts](file:///d:/Coding%20files/Career%20Copilot%20AI/career-copilot-server/src/models/User.ts))
Stores information about the candidate.
*   `googleId`: String (Google OAuth unique identifier)
*   `name`: String (Required)
*   `email`: String (Required, Unique)
*   `avatar`: String (Profile photo URL)
*   `currentRole`: String (Default: `""`)
*   `experience`: Number (Default: `0`)
*   `preferences`: Subdocument (Target Role, Location, Remote, Expected Salary)
*   `timestamps`: Created at, Updated at

### 2. UserUsage Schema ([UserUsage.ts](file:///d:/Coding%20files/Career%20Copilot%20AI/career-copilot-server/src/models/UserUsage.ts))
Tracks the user's subscription plan and analysis generation quotas.
*   `userId`: ObjectId (Ref: `User`, Required)
*   `plan`: `"FREE" | "PRO" | "ENTERPRISE"` (Default: `"FREE"`)
*   `analysisCreated`: Number (Count of analyses generated)
*   `createdAnalysisIds`: Array of ObjectIds (Ref: `Analysis`)

### 3. Resume Schema ([Resume.ts](file:///d:/Coding%20files/Career%20Copilot%20AI/career-copilot-server/src/models/Resume.ts))
Holds raw text, cloud hosting links, and parser output.
*   `userId`: ObjectId (Ref: `User`, Required)
*   `originalName`: String (e.g. `my_cv.pdf`)
*   `filename`: String (Cloudinary public ID)
*   `filePath`: String (Cloudinary secure URL)
*   `rawText`: String (Unformatted text from the PDF/Word file)
*   `parsedData`: Subdocument conforming to structured extraction:
    *   `name`: String, `email`: String, `phone`: String
    *   `skills`: Array of Strings
    *   `projects`: Array of `{ title: String, description: String }`
    *   `experience`: Array of `{ company: String, role: String, duration: String }`
    *   `education`: Array of `{ institution: String, degree: String }`
*   `isActive`: Boolean (Default: `true`)

### 4. JobDescription Schema ([JobDescription.ts](file:///d:/Coding%20files/Career%20Copilot%20AI/career-copilot-server/src/models/JobDescription.ts))
Stores targeted jobs description.
*   `userId`: ObjectId (Ref: `User`, Required)
*   `title`: String (Required)
*   `company`: String (Default: `""`)
*   `description`: String (Required, raw JD text)
*   `extractedSkills`: Array of Strings (Default: `[]`)

### 5. Analysis Schema ([Analysis.ts](file:///d:/Coding%20files/Career%20Copilot%20AI/career-copilot-server/src/models/Analysis.ts))
The core assessment object compiling status and details for each analysis tool.
*   `userId`: ObjectId (Ref: `User`, Required)
*   `resumeId`: ObjectId (Ref: `Resume`, Required)
*   `jobDescriptionId`: ObjectId (Ref: `JobDescription`, Required)
*   `status`: `"pending" | "running" | "completed" | "failed"`
*   `toolStatus`: Status enum for each pipeline step (`ats`, `skillGap`, `optimizer`, `coverLetter`, `interview`, `roadmap`).
*   `results`:
    *   **`ats`**: Score, strengths, weaknesses, missing keywords, summary.
    *   **`skillGap`**: Missing skills, recommended skills, learning priorities.
    *   **`optimizer`**: ATS Impact (`currentScore`, `expectedScore`), keyword suggestions, experience/project tweaks, and optimized content markdown.
    *   **`coverLetter`**: Subject and body content.
    *   **`interview`**: Segregated questions (HR, Technical, Behavioral, Follow-ups). Includes generated answer statuses and content.
    *   **`roadmap`**: Roadmap overview, milestones, steps (hours, outcomes), resources, and checklists.

---

## Core Workflows

### 1. Google Single-Sign-On & JWT Verification
```
[Client] --- Passes Google ID Token ---> [POST /api/auth/google]
                                                |
                                        Verifies via Google Client
                                                |
                                  Upserts User & Signs 7D Token
                                                |
[Client] <--- Returns JWT + User Object <-------+
```

### 2. Resume Upload & Parser Pipeline
```
[Client] --- Uploads File ---> [POST /api/resumes/upload]
                                      |
                           Checks file extension (.pdf/.docx)
                                      |
                           Extracts raw text via pdf-parse/mammoth
                                      |
                           Instructs Gemini to structure data
                                      |
                           Uploads binary to Cloudinary
                                      |
[Client] <--- Returns Structured Resume Data <---+
```

### 3. Analysis Quota Enforcement
Before starting a new analysis, the `checkAnalysisQuota` middleware intercepts the request. It queries the `UserUsage` schema to ensure the user has not exceeded the limits of their plan (`FREE`, `PRO`, `ENTERPRISE`).

### 4. Analysis Pipeline Execution Workflow
The pipeline execution is initiated through GraphQL and reports progress sequentially via SSE:
```
[Client] ---- Mutates startAnalysis(analysisId) ----> [Server]
   |                                                     |
   | (Connects to GET /api/stream/:analysisId)           | Starts Pipeline
   |                                                     |
   |<--- Event: "ATS Score Calculation..." (10%) <--------+ Runs ATSTool
   |<--- Event: "ATS Score Calculation completed" (25%) <+ Saves ATS Results
   |                                                     |
   |<--- Event: "Analyzing missing skills..." (30%) <----+ Runs SkillGapTool
   |<--- Event: "Skill Gap analysis completed" (50%) <---+ Saves SkillGap Results
   |                                                     |
   |<--- Event: "Optimizing resume..." (55%) <-----------+ Runs OptimizerTool
   |<--- Event: "Resume optimization completed" (75%) <--+ Saves Optimizer Results
   |                                                     |
   |<--- Event: "Generating cover letter..." (80%) <-----+ Runs CoverLetterTool
   |<--- Event: "Analysis completed." (100%) <----------+ Saves CoverLetter & Marks DONE
```

---

## API Docs: REST API Reference

All REST endpoints prefix: `/api`

### 1. Health Checks
*   **Endpoint**: `GET /api/health`
*   **Auth Required**: No
*   **Description**: Evaluates if the service is running.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "service": "CareerCopilot API",
      "status": "healthy",
      "timestamp": "2026-07-08T11:42:00.000Z"
    }
    ```

### 2. Authentication
*   **Endpoint**: `POST /api/auth/google`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "token": "GOOGLE_OAUTH2_ID_TOKEN"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "token": "JWT_TOKEN_STRING",
      "user": {
        "_id": "603d3f9b2d87e0234a9b4001",
        "googleId": "103984920394029490203",
        "name": "Alex Candidate",
        "email": "alex@example.com",
        "avatar": "https://lh3.googleusercontent.com/a/avatar_url",
        "currentRole": "",
        "experience": 0,
        "preferences": {
          "targetRole": "",
          "location": "",
          "remote": false,
          "expectedSalary": 0
        },
        "createdAt": "2026-07-08T11:40:00.000Z",
        "updatedAt": "2026-07-08T11:40:00.000Z"
      }
    }
    ```
*   **Endpoint**: `GET /api/auth/me`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Description**: Returns active user record.
*   **Response (200 OK)**: User object structure.

*   **Endpoint**: `PUT /api/auth/me`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Description**: Modifies profile parameters (e.g. currentRole, preferences).
*   **Request Body**:
    ```json
    {
      "currentRole": "Software Engineer",
      "experience": 3,
      "preferences": {
        "targetRole": "Senior Engineer",
        "location": "Remote",
        "remote": true,
        "expectedSalary": 120000
      }
    }
    ```
*   **Response (200 OK)**: Updated user object.

### 3. Resumes
*   **Endpoint**: `POST /api/resumes/upload`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Content-Type**: `multipart/form-data`
*   **Request Payload**: Form field `resume` (Binary `.pdf` or `.docx` file, max 5MB).
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "resume": {
        "_id": "603d3f9b2d87e0234a9b4002",
        "userId": "603d3f9b2d87e0234a9b4001",
        "originalName": "Alex_CV.pdf",
        "filename": "cv_cloudinary_public_id",
        "filePath": "https://res.cloudinary.com/.../cv_cloudinary_public_id.pdf",
        "rawText": "Extracted text content...",
        "parsedData": {
          "name": "Alex Candidate",
          "email": "alex@example.com",
          "phone": "+1234567890",
          "skills": ["JavaScript", "React", "TypeScript", "Node.js"],
          "projects": [],
          "experience": [],
          "education": []
        },
        "isActive": true,
        "createdAt": "2026-07-08T11:41:00.000Z",
        "updatedAt": "2026-07-08T11:41:00.000Z"
      }
    }
    ```

*   **Endpoint**: `GET /api/resumes/:resumeId`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Description**: Fetches the parsed metadata and raw text of a specific resume if owned by the caller.

### 4. Job Descriptions
*   **Endpoint**: `POST /api/job-descriptions`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Request Body**:
    ```json
    {
      "title": "Senior Frontend Developer",
      "company": "Tech Corp",
      "description": "We are seeking a Senior Frontend Engineer proficient in React, TypeScript...",
      "extractedSkills": ["React", "TypeScript", "Tailwind CSS"]
    }
    ```
*   **Response (201 Created)**: Created JobDescription document.

*   **Endpoint**: `POST /api/job-descriptions/import`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Request Body**:
    ```json
    {
      "url": "https://company.com/careers/senior-frontend-developer"
    }
    ```
*   **Description**: Imports and extracts a Job Description from a remote URL.
*   **Response (200 OK)**: Extracted title, company, and raw job description.

*   **Endpoint**: `GET /api/job-descriptions`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Description**: Fetches all job descriptions created by the user.

*   **Endpoint**: `GET /api/job-descriptions/:jobId/analyses`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Description**: Retrieves partial Analysis metadata linked with the given jobId.
*   **Response (200 OK)**:
    ```json
    [
      {
        "_id": "603d3f9b2d87e0234a9b4003",
        "createdAt": "2026-07-08T11:42:00.000Z",
        "updatedAt": "2026-07-08T11:43:00.000Z"
      }
    ]
    ```

### 5. Analysis Lifecycle & Quota Features
*   **GET `/api/analyses/dashboard`** — Fetches all job descriptions and their corresponding pruned analysis metadata, sorted by date (used for fast loading dashboard). (Auth: Yes)
*   **GET `/api/analyses/usage`** — Fetches the current user's usage summary against their plan limits. (Auth: Yes)
*   **POST `/api/analyses`** — Initializes an analysis. Enforces quotas.
*   **POST `/api/analyses/:analysisId/start`** — Triggers the main pipeline.
*   **DELETE `/api/analyses/:analysisId`** — Deletes the given analysis.
*   **POST `/api/analyses/:analysisId/interview`** — Launches interview questions generator.
*   **POST `/api/analyses/:analysisId/roadmap`** — Launches roadmap generator.
*   **POST `/api/analyses/:analysisId/questions/:questionId/answer`** — Triggers the asynchronous generation of a single interview question's answer, streaming response chunks via SSE.

---

## API Docs: Server-Sent Events (SSE)

Real-time pipeline monitoring is handled via a dedicated Server-Sent Events endpoint.

*   **Endpoint**: `GET /api/stream/:analysisId`
*   **Auth Required**: No (Access regulated by analysisId)
*   **Headers sent by server**:
    ```http
    Content-Type: text/event-stream
    Cache-Control: no-cache
    Connection: keep-alive
    X-Accel-Buffering: no
    ```

### SSE Message Formats

#### Progress Event
Sent when a tool begins execution or completes successfully.
```json
data: {
  "type": "progress",
  "step": "ATS",
  "message": "Calculating ATS score...",
  "progress": 10
}
```

#### Step Completed (With Payload Data)
Sent when a step completes, providing the updated step results.
```json
data: {
  "type": "progress",
  "step": "ATS",
  "message": "ATS Score Calculation completed",
  "progress": 25,
  "data": {
    "score": 85,
    "strengths": ["Strong typescript core", "Comprehensive project descriptions"],
    "weaknesses": ["Lack of cloud hosting details"],
    "missingKeywords": ["AWS", "CI/CD"],
    "summary": "The candidate has high frontend competence but lacks deployments."
  }
}
```

#### Final Completed Event
Sent at 100% completion of the core pipeline.
```json
data: {
  "type": "progress",
  "step": "Cover Letter",
  "progress": 100,
  "message": "Cover letter generated.",
  "data": {
    "subject": "Application for Senior Frontend Developer",
    "content": "Dear Hiring Manager..."
  }
}
```

#### Individual Answer Streaming Events
When generating answers on-demand via the specific answer endpoint, these distinct events are emitted to power typewriter-style UI effects:
*   **`answer_started`**: Indicates LLM has begun formulating a response.
*   **`answer_delta`**: Streams chunks of the answer text in real-time.
    ```json
    data: {
      "type": "answer_delta",
      "questionId": "q-1234",
      "delta": "In my previous role, "
    }
    ```
*   **`answer_completed`**: Signifies the end of the generation stream.
*   **`answer_error`**: Triggered if generation fails abruptly.

---

## API Docs: GraphQL Schema & Resolvers

The backend hosts Apollo Server at `/graphql`. Operations require JWT authorization via the request headers.

### Queries

#### `getAnalysis(id: ID!): Analysis`
Fetches the full results and state of an analysis document.

*   **Sample Query**:
    ```graphql
    query GetAnalysis($id: ID!) {
      getAnalysis(id: $id) {
        id
        status
        toolStatus {
          ats
          skillGap
          optimizer
          coverLetter
          interview
          roadmap
        }
        results {
          ats {
            score
            summary
          }
        }
      }
    }
    ```
*   **Variables**:
    ```json
    { "id": "603d3f9b2d87e0234a9b4003" }
    ```

### Actions (REST Alternatives to Mutations)

Due to timeouts and long-running generative processes, mutations have been fully replaced with standard REST endpoints. 

#### 1. Create Analysis
*   **Endpoint**: `POST /api/analyses`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Request Body**:
    ```json
    {
      "resumeId": "603d3f9b2d87...",
      "jobDescriptionId": "603d3f9b2d88..."
    }
    ```
*   **Response (201 Created)**: Returns the newly generated Analysis ID with a `pending` status.

#### 2. Start Core Pipeline
*   **Endpoint**: `POST /api/analyses/:analysisId/start`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Description**: Triggers the asynchronous pipeline execution (ATS, Skill Gap, Optimizer, Cover Letter). Connect to the SSE endpoint to monitor progress.

#### 3. Generate Interview Questions
*   **Endpoint**: `POST /api/analyses/:analysisId/interview`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Condition**: Core pipeline analysis must be in a `completed` state.
*   **Description**: Launches asynchronous Gemini agent to generate 7 categories of interview questions based on the candidate's skills and the JD.

#### 4. Generate Learning Roadmap
*   **Endpoint**: `POST /api/analyses/:analysisId/roadmap`
*   **Auth Required**: Yes (`Bearer <token>`)
*   **Condition**: Interview question generation must be in a `completed` state.
*   **Description**: Launches asynchronous Gemini agent to assemble personalized roadmap milestones and steps based on the identified skill gaps.

---

## Local Development & Setup

Follow these instructions to run the server locally.

### 1. File Configuration
Add a `.env` file at the root of `career-copilot-server/` with the variables described below:

```ini
# Port setup
PORT=5000

# MongoDB credentials
MONGO_URI=mongodb://your_mongo_db_uri

# JWT Authentication
JWT_SECRET=your_jwt_signing_secret

# Google OAuth (obtainable from Google Cloud Console Credentials)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LLM Keys
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary Integration (from Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://apikey:apisecret@cloudname

# LangSmith tracing (Optional, for LLM tracing)
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT="CareerCopilot AI"

# CORS configuration (Origins allowed to query server)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5000
```

### 2. Dependency Installation
Run standard npm commands:
```bash
npm install
```

### 3. Execution Commands
*   **Development environment** (Hot reloading with `ts-node-dev`):
    ```bash
    npm run dev
    ```
*   **Build** (Compiles files from TS to JS to `/dist`):
    ```bash
    npm run build
    ```
*   **Production run**:
    ```bash
    npm start
    ```
