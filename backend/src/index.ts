import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupWebSocketServer } from './websocket';
import html_main from './htmlChain';
import jwt from 'jsonwebtoken';
import { PrismaClient } from "../../frontend/node_modules/.prisma/client";
import Ats from './ats_score';
import AiCoach from './ai_coach';
import CoverLetter from './ai_coverletter';


dotenv.config();

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION - keeping process alive:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED PROMISE REJECTION - keeping process alive:', reason);
});


interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}


const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const server = http.createServer(app);
const wss = setupWebSocketServer(server);

const extractUserFromToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('No authorization header or not a Bearer token');
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET as string) as any;
    req.user = {
      id: decoded.id || decoded.sub || ''
    };
    
    
    if (!req.user.id) {
      res.status(401).json({ error: 'Unauthorized: No user ID in token' });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};

app.get('/api/generate-resume', extractUserFromToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID not found in token' });
      return;
    }


    const checkOnly = req.query.checkOnly === 'true';
    const prisma = new PrismaClient();
    
    try {

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { formatted: true }
      });
      if (checkOnly) {
        if (existingUser && existingUser.formatted) {
          res.setHeader('Content-Type', 'text/html');
          res.send(existingUser.formatted);
        } else {
          const html = await html_main(userId);
          let htmlContent: string;
          if (typeof html === 'string') {
            htmlContent = html;
          } else if (typeof html === 'object' && html !== null) {
            htmlContent = 
              (html as any).text || 
              (html as any).content || 
              html.toString();
          } else {
            htmlContent = String(html);
          }
          res.setHeader('Content-Type', 'text/html');
          res.send(html);
        }
        await prisma.$disconnect();
        return;
      }
      

      const html = await html_main(userId);
      

      let htmlContent: string;
      if (typeof html === 'string') {
        htmlContent = html;
      } else if (typeof html === 'object' && html !== null) {

        htmlContent = 
          (html as any).text || 
          (html as any).content || 
          html.toString();
      } else {
        htmlContent = String(html);
      }
      
      await prisma.user.upsert({
        where: { id: userId },
        update: { formatted: htmlContent } as any,
        create: {
          id: userId,
          email: `user-${userId}@example.com`, // Placeholder email
          username: `user-${userId}`, // Placeholder username
          password: "placeholder", // Placeholder password
          role: "USER",
          profile: "{}",
          formatted: htmlContent,
          credits: 3 // Default credits
        } as any
      });
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (dbError) {
      console.error('Database error:', dbError);

      if (!checkOnly) {
        const html = await html_main(userId);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        res.status(500).json({ error: 'Database error' });
      }
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ error: 'Failed to generate resume' });
  }
});


app.post('/api/update-profile', extractUserFromToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID not found in token' });
      return;
    }
    
    const { profileData } = req.body;
    
    if (!profileData) {
      res.status(400).json({ error: 'Profile data is required' });
      return;
    }
    

    const prisma = new PrismaClient();
    
    try {

      const profileString = typeof profileData === 'string' 
        ? profileData 
        : JSON.stringify(profileData);

      await prisma.user.update({
        where: { id: userId },
        data: { profile: profileString } as any
      });
      
      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Failed to update profile in database' });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


app.post('/api/ats-score', extractUserFromToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID not found in token' });
      return;
    }
    
    const { jobDescription } = req.body;
    
    if (!jobDescription) {
      res.status(400).json({ error: 'Job description is required' });
      return;
    }
    

    const prisma = new PrismaClient();
    
    try {

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profile: true }
      });
      
      if (!user || !user.profile) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }
      

      let profileData = user.profile;
      

      if (typeof profileData === 'string') {
        try {
          profileData = JSON.parse(profileData);
        } catch (parseError) {
          console.error('Error parsing profile JSON:', parseError);

        }
      }
      

      const profileText = typeof profileData === 'string' 
        ? profileData 
        : JSON.stringify(profileData);
      

      const atsResult = await Ats(jobDescription, profileText);
      

      let processedResult;
      
      try {

        if (atsResult && 
            typeof atsResult === 'object' && 
            'kwargs' in atsResult && 
            atsResult.kwargs && 
            typeof atsResult.kwargs === 'object' && 
            'content' in (atsResult.kwargs as Record<string, unknown>)) {
          
          const content = (atsResult.kwargs as Record<string, unknown>).content;
          

          if (typeof content === 'string') {
            try {
              processedResult = JSON.parse(content);
            } catch (jsonError) {
              processedResult = content;
            }
          } else {
            processedResult = content;
          }
        } else if (atsResult && 
                  typeof atsResult === 'object' && 
                  'text' in atsResult && 
                  atsResult.text !== undefined) {
          

          const text = atsResult.text;
          
          if (typeof text === 'string') {
            try {
              processedResult = JSON.parse(text);
            } catch (jsonError) {
              processedResult = text;
            }
          } else {
            processedResult = text;
          }
        } else {

          processedResult = atsResult;
        }
        

        res.status(200).json(processedResult);
      } catch (error) {
        console.error('Error processing ATS result:', error);
        

        res.status(200).json(atsResult);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Failed to retrieve profile from database' });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error generating ATS score:', error);
    res.status(500).json({ error: 'Failed to generate ATS score' });
  }
});


app.post('/api/ai-coach', extractUserFromToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID not found in token' });
      return;
    }
    
    const { jobDescription } = req.body;
    
    if (!jobDescription) {
      res.status(400).json({ error: 'Job description is required' });
      return;
    }
    

    const prisma = new PrismaClient();
    
    try {

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profile: true }
      });
      
      if (!user || !user.profile) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }
      

      let profileData = user.profile;
      

      if (typeof profileData === 'string') {
        try {
          profileData = JSON.parse(profileData);
        } catch (parseError) {
          console.error('Error parsing profile JSON:', parseError);

        }
      }
      

      const profileText = typeof profileData === 'string' 
        ? profileData 
        : JSON.stringify(profileData);
      

      const coachResult = await AiCoach(jobDescription, profileText);
      

      res.status(200).json(coachResult);
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Failed to retrieve profile from database' });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error generating AI Coach guidance:', error);
    res.status(500).json({ error: 'Failed to generate AI Coach guidance' });
  }
});


app.post('/api/cover-letter', extractUserFromToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID not found in token' });
      return;
    }
    
    const { jobDescription } = req.body;
    
    if (!jobDescription) {
      res.status(400).json({ error: 'Job description is required' });
      return;
    }
    

    const prisma = new PrismaClient();
    
    try {

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profile: true }
      });
      
      if (!user || !user.profile) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }
      

      let profileData = user.profile;
      

      if (typeof profileData === 'string') {
        try {
          profileData = JSON.parse(profileData);
        } catch (parseError) {
          console.error('Error parsing profile JSON:', parseError);

        }
      }
      

      const profileText = typeof profileData === 'string' 
        ? profileData 
        : JSON.stringify(profileData);
      

      const letterResult = await CoverLetter(jobDescription, profileText);
      

      res.status(200).json(letterResult);
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Failed to retrieve profile from database' });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error generating Cover Letter:', error);
    res.status(500).json({ error: 'Failed to generate Cover Letter' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
