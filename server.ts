import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "BOTSCHAFT Professional Training" });
});

// 1. Generate Personalized Learning Path
app.post("/api/ai/generate-path", async (req, res) => {
  try {
    const { domain, currentLevel, goal, weeklyHours } = req.body;
    
    const prompt = `Create a personalized professional training curriculum for the domain: "${domain}".
User's current level: "${currentLevel}".
User's career goal: "${goal}".
Available weekly study hours: ${weeklyHours}.

Return a JSON object with:
- title: string (Curriculum title)
- description: string
- estimatedWeeks: number
- difficulty: string
- modules: array of objects, each containing:
  - id: string
  - title: string
  - description: string
  - duration: string
  - topics: array of strings
  - practicalProject: string
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedWeeks: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  practicalProject: { type: Type.STRING }
                },
                required: ["id", "title", "description", "duration", "topics", "practicalProject"]
              }
            }
          },
          required: ["title", "description", "estimatedWeeks", "difficulty", "modules"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error generating path:", error);
    res.status(500).json({ error: error.message || "Failed to generate path" });
  }
});

// 2. AI Tutor Chat
app.post("/api/ai/chat-tutor", async (req, res) => {
  try {
    const { domain, moduleTitle, messages, userQuestion } = req.body;

    const systemInstruction = `You are BOTSCHAFT AI, an expert professional training tutor specialized in "${domain}". 
You are currently assisting a student studying "${moduleTitle}".
Be encouraging, precise, professional, and practical. Provide concrete examples and industry standards.`;

    const chatHistory = (messages || []).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3.7-flash",
      config: {
        systemInstruction,
      },
    });

    // If there is history, we can seed or just send the message.
    // For simplicity with chats, let's send the latest message or reconstruct if needed.
    // Actually chat.sendMessage accepts the message string.
    const response = await chat.sendMessage({
      message: userQuestion
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in chat tutor:", error);
    res.status(500).json({ error: error.message || "Failed to get AI tutor response" });
  }
});

// 3. AI Quiz Generator
app.post("/api/ai/generate-quiz", async (req, res) => {
  try {
    const { domain, moduleTitle, topic } = req.body;

    const prompt = `Generate a 5-question professional certification quiz for domain "${domain}", module "${moduleTitle}", focusing on "${topic}".
Return a JSON array of questions, each with:
- id: string
- question: string
- options: array of 4 strings
- correctAnswerIndex: number (0-3)
- explanation: string
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });

    const quiz = JSON.parse(response.text || "[]");
    res.json({ quiz });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
});

// 4. AI Simulation Lab Evaluator
app.post("/api/ai/evaluate-simulation", async (req, res) => {
  try {
    const { domain, scenarioTitle, userAction } = req.body;

    const prompt = `You are evaluating a professional practical simulation for "${domain}" in the scenario "${scenarioTitle}".
The student took the following action or response: "${userAction}"

Evaluate this action professionally. Return a JSON object with:
- score: number (0 to 100)
- feedback: string (constructive critique)
- strengths: array of strings
- improvements: array of strings
- expertTip: string
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            expertTip: { type: Type.STRING }
          },
          required: ["score", "feedback", "strengths", "improvements", "expertTip"]
        }
      }
    });

    const evaluation = JSON.parse(response.text || "{}");
    res.json(evaluation);
  } catch (error: any) {
    console.error("Error evaluating simulation:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate simulation" });
  }
});

// 5. AI Career & Skill Advisor
app.post("/api/ai/career-advice", async (req, res) => {
  try {
    const { completedCourses, careerGoal } = req.body;

    const prompt = `Analyze the student's completed courses: ${JSON.stringify(completedCourses || [])} and target career goal: "${careerGoal}".
Provide career guidance and recommendations in JSON format with:
- readinessScore: number (0 to 100)
- missingSkills: array of strings
- recommendedCertifications: array of strings
- marketDemandSummary: string
- interviewTips: array of strings
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readinessScore: { type: Type.NUMBER },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedCertifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            marketDemandSummary: { type: Type.STRING },
            interviewTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["readinessScore", "missingSkills", "recommendedCertifications", "marketDemandSummary", "interviewTips"]
        }
      }
    });

    const advice = JSON.parse(response.text || "{}");
    res.json(advice);
  } catch (error: any) {
    console.error("Error getting career advice:", error);
    res.status(500).json({ error: error.message || "Failed to get career advice" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BOTSCHAFT server running on http://localhost:${PORT}`);
  });
}

startServer();
