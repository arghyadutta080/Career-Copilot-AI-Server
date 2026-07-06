import JobDescription from "../models/JobDescription";

export async function createJobDescription(userId: string, input: any) {
  return await JobDescription.create({
    userId,
    ...input,
  });
}
