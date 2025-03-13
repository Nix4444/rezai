import { ChatOpenAI } from "@langchain/openai"
export default async function CoverLetter(job_description:string,profile:string){

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const model = await new ChatOpenAI({
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0,
      openAIApiKey: openaiApiKey,
    });

    const prompt = `
    ### AI Cover Letter Generator  

#### *1. Input Data:*  
- *User Profile:* {user_profile}  
- *Target Job Description:* {job_description}  

---

#### *2. Cover Letter Structure & Guidelines:*  

The AI should generate a *personalized, well-structured cover letter* following these sections:  

*1. Header & Greeting:*  
- Format with the *user’s name, contact details, and date*.  
- Address the hiring manager *by name* (if available) or use a professional salutation.  

*2. Opening Paragraph (Engaging Introduction):*  
- Clearly mention the *job title* and company name.  
- Show enthusiasm for the role and why the user is excited about the opportunity.  
- Mention a *compelling reason* that makes the user a strong fit for the company.  

*3. Body Paragraphs (Skills & Experience Matching JD):*  
- Highlight *key skills, past experiences, and achievements* relevant to the job.  
- Use *quantifiable results* to demonstrate impact.  
- Align the user’s *strengths with the job requirements* from the JD.  

*4. Why This Company?*  
- Showcase knowledge about the company’s *values, culture, or mission*.  
- Explain how the user’s skills and experience align with the company’s goals.  

*5. Closing Paragraph (Call to Action):*  
- Express eagerness to discuss further in an interview.  
- Politely request a *meeting or call*.  
- Thank the reader for their time and consideration.  

 *6. Professional Sign-off:*  
- Use a formal closing like *"Sincerely"* or *"Best regards"*, followed by the user’s name.  

---

#### *3. AI Optimization & Personalization:*  
The AI should:  
Ensure the *tone is professional yet engaging*.  
Keep the letter *concise (250-350 words)*.  
Use *dynamic phrasing* based on the user's skills and the JD.  
Adjust *writing style* to fit the user's industry and role.
     job description : ${job_description}
     resume text :${profile}
    `
    const response = await model.invoke(prompt)
    return response
}