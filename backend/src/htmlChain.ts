import { ChatOpenAI } from "@langchain/openai";
import { PrismaClient } from "../../frontend/node_modules/.prisma/client";

export async function generate_html(data:string){
    const boiler_plate = `
    You are an AI agent tasked with generating an HTML resume. You will receive user data from an SQL database, which should be mapped to the provided HTML boilerplate. Your goal is to replace all placeholder values in the boilerplate with the corresponding user details and generate a fully formatted HTML file.
    
    ### Instructions:
    - You must output only the final HTML file as a response—no extra symbols, explanations, or comments.
    - The response should be a well-structured and valid HTML file.
    - Ensure all placeholders (e.g., name, contact details, education, experience, skills) are accurately populated.
    - Keep the formatting, structure, and styling consistent with the provided boilerplate.
    -The placeholders that contain N/A do not include them in the final HTML. make sure to remove them smartly according to the resume.
    - Fields like projects, experience must have bulleted descriptions which are to be generated in a resume friendly language based on the given data or job profile
    
    ### HTML Boilerplate:
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{name}} - Resume</title>
        <style>
        </style>
    </head>
    <body>
        <header>
            <h1>{{name}}</h1>
            <p style="text-align: center;">Phone: {{phone}} | Email: <a href="mailto:{{email}}">{{email}}</a></p>
            <p style="text-align: center;">LinkedIn: <a href="{{linkedin}}" target="_blank">{{linkedin}}</a></p>
            <hr>
        </header>
        
        <section>
            <h2>EDUCATION</h2>
            {{education}}
            <hr>
        </section>
        
        <section>
            <h2>EXPERIENCE</h2>
            {{experience}}
            <hr>
        </section>
        
        <section>
            <h2>PROJECTS</h2>
            <ul>
                {{projects}}
            </ul>
            <hr>
        </section>
        
        <section>
            <h2>CERTIFICATIONS</h2>
            <ul>
                {{certifications}}
            </ul>
            <hr>
        </section>
        
        <section>
            <h2>SKILLS</h2>
            <ul>
                {{skills}}
            </ul>
            <hr>
        </section>
        
        <section>
            <h2>EXTRACURRICULAR ACTIVITIES</h2>
            <ul>
                {{activities}}
            </ul>
            <hr>
        </section>
    </body>
    </html>
    data:${data}
    `
      const model = new ChatOpenAI({
        model: "o3-mini-2025-01-31",
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      const res = await model.invoke(boiler_plate)


      return res

}

export default async function html_main(userId: string){
    const prisma = new PrismaClient();
    
    try {
        // Try to find the user first
        let user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        
        // If user doesn't exist, create a new user with the given ID
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: `user-${userId}@example.com`, // Placeholder email
                    username: `user-${userId}`, // Placeholder username
                    password: "placeholder", // Placeholder password
                    role: "USER",
                    profile: "{}",
                    formatted: "<p>No resume generated yet.</p>",
                    credits: 3 // Default credits
                }
            });
        }
        
        // If there's no profile data, return a default template
        if (!user.profile || user.profile === '{}') {
            return "<p>No resume data available yet. Please complete the profile creation process first.</p>";
        }
        
        const res_string = JSON.stringify(user);
        const html = await generate_html(res_string);
        
        return html;
    } catch (error) {
        console.error("Error fetching or creating user data:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

