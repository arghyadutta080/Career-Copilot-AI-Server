export const analysisTypeDefs = `#graphql

type JobDescription {
    id: ID!
    title: String!
    company: String
    description: String!
    extractedSkills: [String!]!
}

type ATSResult {
    score: Int
    strengths: [String!]!
    weaknesses: [String!]!
    missingKeywords: [String!]!
}

type SkillGapResult {
    missingSkills: [String!]!
}

type InterviewResult {
    questions: [String!]!
}

type RoadmapResult {
    steps: [String!]!
}

type ResumeOptimizerResult {
    optimizedResume: String
}

type CoverLetterResult {
    content: String
}

type AnalysisResults {
    ats: ATSResult
    skillGap: SkillGapResult
    interview: InterviewResult
    roadmap: RoadmapResult
    optimizer: ResumeOptimizerResult
    coverLetter: CoverLetterResult
}

type Analysis {
    id: ID!

    userId: ID!
    resumeId: ID!
    jobDescriptionId: ID!

    status: String!

    results: AnalysisResults

    createdAt: String!
    updatedAt: String!
}

type Mutation {

    createJobDescription(
        title: String!
        company: String
        description: String!
    ): JobDescription

    createAnalysis(
        resumeId: ID!
        jobDescriptionId: ID!
    ): Analysis

    startAnalysis(
        analysisId: ID!
    ): Boolean!
}

type Query {

    myJobDescriptions: [JobDescription!]!

    getAnalysis(
        id: ID!
    ): Analysis
}
`;