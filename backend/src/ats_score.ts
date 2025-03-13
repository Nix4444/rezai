import { ChatOpenAI } from "@langchain/openai";

export default async function Ats(job_description:string,profile:string){

      const openaiApiKey = process.env.OPENAI_API_KEY;
      const model = await new ChatOpenAI({
        model: "gpt-4o-mini-2024-07-18",
        temperature: 0,
        openAIApiKey: openaiApiKey,
      });

      const prompt = `
      You are a professional resume analyzer. Your task is to compare a resume with a job description and provide detailed feedback.

      our response should be a object formatted with the following structure:
                        {
                            "match_score": "X%",
                            "strengths": ["list of strengths"],
                            "weaknesses": ["list of weaknesses"],
                            "missing_skills": ["list of missing skills"],
                            "suggestions": ["list of improvement suggestions"],
                            "keyword_gaps": ["list of missing keywords"],
                            "formatted_resume": "suggested formatting improvements",
                            "alternative_phrasing": {
                                "original": ["original bullet points"],
                                "suggested": ["suggested bullet points"]
                            }
       provide the  object only without any additional signs and symbols.
       job description : ${job_description}
       resume text :${profile}
      `
      const response = await model.invoke(prompt)
      return response
}