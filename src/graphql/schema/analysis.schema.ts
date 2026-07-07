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
    summary: String!
}

type LearningPriorityItem {
    skill: String!
    reason: String!
}

type SkillGapResult {
    missingSkills: [String!]!
    recommendedSkills: [String!]!
    learningPriority: [LearningPriorityItem!]!
    summary: String!
}

type InterviewQuestion {
    id: String
    question: String
    difficulty: String
    topics: [String]
    answer: String
}

type InterviewFollowUp {
    parentQuestion: String
    followUps: [InterviewQuestion]
}

type InterviewResult {
    hr: [InterviewQuestion]
    resumeBased: [InterviewQuestion]
    experienceBased: [InterviewQuestion]
    projectBased: [InterviewQuestion]
    technical: [InterviewQuestion]
    coding: [InterviewQuestion]
    behavioral: [InterviewQuestion]
    followUps: [InterviewFollowUp]
}

type RoadmapResult {
    steps: [String!]!
}

type ATSImpact {
    currentScore: Int
    expectedScore: Int
    reason: String
}

type ExperienceSuggestion {
    company: String
    role: String
    suggestions: [String]
}

type ProjectSuggestion {
    project: String
    suggestions: [String]
}

type SectionSuggestion {
    section: String
    suggestion: String
}

type ResumeOptimizerResult {
    overallSummary: String
    atsImpact: ATSImpact
    keywordSuggestions: [String]
    experienceSuggestions: [ExperienceSuggestion]
    projectSuggestions: [ProjectSuggestion]
    sectionSuggestions: [SectionSuggestion]
    optimizedContent: String
}

type CoverLetterResult {
    subject: String
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
