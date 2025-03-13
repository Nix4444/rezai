import { ChatOpenAI } from "@langchain/openai";


export default async function AiCoach(job_description:string,profile:string){

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const model = await new ChatOpenAI({
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0.5,
      openAIApiKey: openaiApiKey,
    });

    const prompt = `
    ### AI Coaching Framework  

#### . User Profile & Job Description*  
 *Input Data:*  
- *User Profile:* {profile}  
- *Target Job Description:* {job_description}  
---


####. Systematic Learning Roadmap*  

The AI should generate a structured learning plan divided into phases, including:  

##### *Phase 1: Fundamentals & Conceptual Understanding*  
- Provide *recommended books, courses, and foundational resources*.  
- Offer *real-world case studies and industry insights*.  
- Suggest *interactive exercises or projects* for practical learning.  

##### *Phase 2: Hands-on Skill Development*  
- Assign *real-world projects, coding exercises, or simulations*.  
- Provide *guidance on applying concepts in practical scenarios*.  
- Suggest *internships, freelancing, or mentorship opportunities*.  

##### *Phase 3: Advanced Expertise & Job Readiness*  
- Guide the user in *resume building, interview preparation, and portfolio creation*.  
- Offer *mock interviews and role-specific assessments*.  
- Provide *networking strategies and job application tips*.  

---

####Future Career Growth & Alternate Paths*  

* Relevant Alternate Skills for Future Exploration:*  
Based on the user's learning path, the AI should suggest additional *complementary or advanced skills* that could help them expand their career opportunities. These skills should be relevant to industry trends and future job market demand.  

* Future Career Opportunities:*  
The AI should list potential *industries, sectors, and job types* the user can explore after acquiring the new skills.  

*Potential Job Roles After Skill Development:*  
The AI should provide a list of relevant *job titles* the user can apply for after completing the learning roadmap. These should align with industry expectations and the evolving job market.
     job description : ${job_description}
     resume text :${profile}
     DO NOT RESPOND WITH ANY SPECIAL CHARACTERS OR MARKDOWN
    `
    const response = await model.invoke(prompt)
    return response
}