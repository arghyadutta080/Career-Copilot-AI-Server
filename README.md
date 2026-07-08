# Career Copilot Backend Server - Architecture & API Guide

Welcome to the backend reference guide and documentation for the **Career Copilot Server**. This service runs an Express server in TypeScript, exposing GraphQL endpoints (via Apollo Server), traditional REST APIs, and a Server-Sent Events (SSE) streaming engine. It leverages LangChain and Gemini (`gemini-3.1-pro-preview`) to perform intelligent resume parsing, ATS scoring, skill-gap analysis, optimization proposals, cover letter design, customized interview prep questions, and career roadmap generation.

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
- **AI / LLM Orchestration**: LangChain (`@langchain/google-genai`), targeting `gemini-3.1-pro-preview` with strict structured outputs via Zod schemas.
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
        SSERoute -->|Read status| DB
    end

    ToolRunner -->|Status Updates| SSE
    SSE -->|Stream Event| Client
```

---

## Database Models (Mongoose Schemas)

The codebase defines four primary collections. Click the links below to view their source file definitions:

### 1. User Schema ([User.ts](file:///d:/Coding%20files/Career%20Copilot%20AI/career-copilot-server/src/models/User.ts))
Stores information about the candidate.
*   `googleId`: String (Google OAuth unique identifier)
*   `name`: String (Required)
*   `email`: String (Required, Unique)
*   `avatar`: String (Profile photo URL)
*   `currentRole`: String (Default: `""`)
*   `experience`: Number (Default: `0`)
*   `preferences`: Subdocument
    *   `targetRole`: String
    *   location: String
    *   remote: Boolean
    *   `expectedSalary`: Number
*   `timestamps`: Created at, Updated at

### 2. Resume Schema ([Resume.ts](file:///d:/Coding%20files/Career%20Copilot%20AI/career-copilot-server/src/models/Resume.ts))
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

### 3. JobDescription Schema ([JobDescription.ts](file:///d:/Coding%20files/Career%20Copilot%20AI/career-copilot-server/src/models/JobDescription.ts))
Stores targeted jobs description.
*   `userId`: ObjectId (Ref: `User`, Required)
*   `title`: String (Required, e.g. `Senior Frontend Engineer`)
*   `company`: String (Default: `""`)
*   `description`: String (Required, raw JD text)
*   `extractedSkills`: Array of Strings (Default: `[]`)

### 4. Analysis Schema ([Analysis.ts](file:///d:/Coding%20files/Career%20Copilot%20AI/career-copilot-server/src/models/Analysis.ts))
The core assessment object compiling status and details for each analysis tool.
*   `userId`: ObjectId (Ref: `User`, Required)
*   `resumeId`: ObjectId (Ref: `Resume`, Required)
*   `jobDescriptionId`: ObjectId (Ref: `JobDescription`, Required)
*   `status`: `"pending" | "running" | "completed" | "failed"` (Default: `"pending"`)
*   `toolStatus`: Object containing step statuses:
    *   `ats`, `skillGap`, `optimizer`, `coverLetter`, `interview`, `roadmap`: Each can be `"not_started" | "running" | "completed" | "failed"`
*   `results`: Structured object:
    *   **`ats`**: Score, strengths, weaknesses, missing keywords, summary.
    *   **`skillGap`**: Missing skills, recommended skills, learning priorities (`{ skill, reason }`), summary.
    *   **`optimizer`**: Overall summary, atsImpact (`{ currentScore, expectedScore, reason }`), keyword suggestions, experience suggestions (`{ company, role, suggestions }`), project suggestions (`{ project, suggestions }`), section suggestions (`{ section, suggestion }`), and optimized content markdown.
    *   **`coverLetter`**: Subject and body content.
    *   **`interview`**: HR, Resume-based, Experience-based, Project-based, Technical, Coding, and Behavioral question categories containing unique generated UUID IDs, question text, difficulty, topics, and sample responses.
    *   **`roadmap`**: Roadmap overview, milestones list containing steps (`{ title, order, priority, estimatedHours, resources: [{ title, type, query, reason }], outcomes }`), and interview preparation checklists.

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

### 3. Analysis Pipeline Execution Workflow
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

### 3. Resume Upload
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
    ```

### SSE Message Formats
Messages are sent as standard JSON payloads matching the following structures:

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

### Mutations

#### 1. `createAnalysis(resumeId: ID!, jobDescriptionId: ID!): Analysis`
Initializes a new analysis document with a status of `"pending"`.
*   **Sample Mutation**:
    ```graphql
    mutation CreateAnalysis($resumeId: ID!, $jobDescriptionId: ID!) {
      createAnalysis(resumeId: $resumeId, jobDescriptionId: $jobDescriptionId) {
        id
        status
      }
    }
    ```

#### 2. `startAnalysis(analysisId: ID!): Boolean!`
Triggers the asynchronous pipeline execution containing ATS, Skill Gap, Resume Optimizer, and Cover Letter tools. Dispatches progress to SSE stream.
*   **Sample Mutation**:
    ```graphql
    mutation StartAnalysis($analysisId: ID!) {
      startAnalysis(analysisId: $analysisId)
    }
    ```

#### 3. `generateInterviewQuestions(analysisId: ID!): Boolean!`
*   **Condition**: Core pipeline analysis must be in `completed` state.
*   **Description**: Launches asynchronous Gemini agent to generate 7 categories of interview questions.
*   **Sample Mutation**:
    ```graphql
    mutation GenerateInterview($analysisId: ID!) {
      generateInterviewQuestions(analysisId: $analysisId)
    }
    ```

#### 4. `generateLearningRoadmap(analysisId: ID!): Boolean!`
*   **Condition**: Interview question generation must be in `completed` state.
*   **Description**: Launches Gemini agent to assemble personalized roadmap milestones and steps based on skill gaps.
*   **Sample Mutation**:
    ```graphql
    mutation GenerateRoadmap($analysisId: ID!) {
      generateLearningRoadmap(analysisId: $analysisId)
    }
    ```

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
