export const analysisTypeDefs = `#graphql

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

type LearningResource {
  title: String
  type: String
  query: String
  reason: String
}

type RoadmapStep {
  order: Int
  title: String
  description: String
  priority: String
  estimatedHours: Int
  resources: [LearningResource]
  outcomes: [String]
}

type RoadmapMilestone {
  title: String
  description: String
  steps: [RoadmapStep]
}

type LearningRoadmap {
  overview: String
  milestones: [RoadmapMilestone]
  interviewChecklist: [String]
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
    roadmap: LearningRoadmap
    optimizer: ResumeOptimizerResult
    coverLetter: CoverLetterResult
}

type ToolStatus {
  ats: String!
  skillGap: String!
  optimizer: String!
  coverLetter: String!
  interview: String!
  roadmap: String!
}

type Analysis {
    id: ID!

    userId: ID!
    resumeId: ID!
    jobDescriptionId: ID!

    status: String!
    toolStatus: ToolStatus!

    results: AnalysisResults

    createdAt: String!
    updatedAt: String!
}

type Mutation {

    createAnalysis(
        resumeId: ID!
        jobDescriptionId: ID!
    ): Analysis

    startAnalysis(
        analysisId: ID!
    ): Boolean!

    generateInterviewQuestions(
        analysisId: ID!
    ): Boolean!

    generateLearningRoadmap(
        analysisId: ID!
    ): Boolean!
}

type Query {

    getAnalysis(
        id: ID!
    ): Analysis
}
`;
