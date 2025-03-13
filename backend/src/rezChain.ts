import dotenv from "dotenv";
import axios from "axios";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { PrismaClient } from "../../frontend/node_modules/.prisma/client";

dotenv.config();

let obj: { [key: string]: string } = {}; 
const prisma = new PrismaClient();

export default async function Chain(inputHandler?: (prompt: string) => Promise<string>) {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    console.error("Missing OpenAI API Key. Set it in your .env file.");
    process.exit(1);
  }

  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini-2024-07-18",
    temperature: 0.7,
    openAIApiKey: openaiApiKey,
  });

  const memory = new BufferMemory();

  const conversation = new ConversationChain({
    llm,
    memory,
    verbose: false,
  });

  const categories = [
    "Basic Details",
    "Education",
    "Work Experience",
    "Skills",
    "Projects",
    "Professional Development",
    "Volunteer Experience"
];

const categorySubheadings: { [key: string]: string[] } = {
  "Basic Details": ["Name", "Contact Information", "Location", "LinkedIn Profile"],
  "Work Experience": ["Job Title", "Company", "Start and End Dates", "Key Responsibilities"],
  "Education": ["Degree", "University", "Graduation Date", "CGPA"],
  "Skills": ["Technical Skills", "Tools and Software", "Soft Skills"],
  "Projects": [" Description", "Technologies Used"],
  "Professional Development": ["Certifications"],
  "Volunteer Experience": ["Organization"]

};

  const paragraph_template_creator = async (subcategory: string, str: string) => {
    const paragraph_templates_prompt = `
      You have been given a set of prompt templates for different resume subcategories. For the given subcategory and the collected information, map the values to the appropriate template and return the filled template without any brackets or placeholders.

      Paragraph Templates:
      Basic Details:
      "[Full Name] is a [Professional Summary] based in [Location]. They can be reached at [Contact Information] and maintains professional profiles on [LinkedIn Profile] and [GitHub Profile]."

      Education:
      "[Degree] from [University], completed in [Graduation Date] with a [CGPA] GPA. Relevant coursework includes [Relevant Coursework]. During this time, [Name] was recognized with [Honors and Awards] and participated in [Extracurricular Activities]."

      Work Experience:
      "As a [Job Title] at [Company] from [Start Date] to [End Date], [Name] was responsible for [Key Responsibilities]. Notable achievements include [Achievements], utilizing [Technologies Used]. [Name] managed a team of [Team Size] and oversaw a budget of [Budget Responsibility]."

      Skills:
      "Technical expertise in [Technical Skills], complemented by [Soft Skills]. Proficient in [Languages] and experienced with [Tools and Software]. Certified in [Certifications]."

      Projects:
      "Developed [Description] using [Technologies Used]."

      Professional Development:
      "Attended [Workshops, Conferences] and completed [Online Courses, Training Programs]. Holds certifications in [Certifications]."

      Volunteer Experience:
      "Volunteered at [Organization]"


      Subcategory: ${subcategory}
      Collected Information: ${str}

      Return only the filled template with the provided information. If some information is missing, use "[N/A]" for those placeholders. Maintain professional language and ensure proper formatting.
    `;

    const model = new ChatOpenAI({
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0,
      openAIApiKey: openaiApiKey,
    });

    const res = await model.invoke(paragraph_templates_prompt);
    return res;
  };

  async function runConversation() {
    for (const category of categories) {
      const subheadings = categorySubheadings[category] || [];
      let categoryData: { [key: string]: string } = {};

      for (const subheading of subheadings) {
        let responseReceived = false;
        while (!responseReceived) {
          const questionPrompt = `Ask the user for their ${subheading} in the category ${category}. Phrase this as a natural, conversational question.`;
          const response = await conversation.call({ input: questionPrompt });
          const question = response.response;
          const userInput = await getUserInput(question);

          const relevanceCheckPrompt = `Does the following user input provide information about their ${subheading}? Input: "${userInput}". Answer strictly with "yes" or "no".`;
          const relevanceResponse = await conversation.call({ input: relevanceCheckPrompt });
          const isRelevant = relevanceResponse.response.toLowerCase().trim().includes("yes");

          if (isRelevant) {
            categoryData[subheading] = userInput;
            responseReceived = true;
          }
        }
      }

      const categoryResponse = Object.values(categoryData).join(" ");
      const res = await paragraph_template_creator(category, categoryResponse.trim());
      obj[category] = String(res.content);
    }
  }

  async function getUserInput(prompt: string): Promise<string> {
    if (inputHandler) {
      return inputHandler(prompt);
    }
    
    try {
      const response = await axios.get('http://example.com/api/answer', {
        params: { prompt }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching input from API:", error);
      return "[N/A]";
    }
  }

  await runConversation();
  
  async function saveResumeToPrisma(userId: string) {
    if (!userId) {
      console.error("No user ID provided for saving resume data");
      throw new Error("No user ID provided for saving resume data");
    }
    
    const prisma = new PrismaClient();
    
    try {
      const userData = {
        basic_details: obj["Basic Details"] || null,
        education: obj["Education"] || null,
        work_experience: obj["Work Experience"] || null,
        skills: obj["Skills"] || null,
        projects: obj["Projects"] || null,
        certifications: obj["Professional Development"] || null,
        extracurricular: obj["Volunteer Experience"] || null
      };
    

      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!existingUser) {
        console.error(`User with ID ${userId} not found`);
        throw new Error(`User with ID ${userId} not found. Please ensure user exists before saving resume data.`);
      }
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profile: JSON.stringify(userData)
        }
      });
      return updatedUser;
    } catch (error) {
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
  
  return {
    resumeData: obj,
    saveToDatabase: saveResumeToPrisma
  };
}
