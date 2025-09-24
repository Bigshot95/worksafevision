import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertAssessmentSchema, updateAssessmentSchema } from "@shared/schema";
import { analyzeSafetyImage } from "./services/gemini";

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new assessment with image analysis
  app.post('/api/assessments', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
      }

      const { workerId, workerName, shift } = req.body;
      
      if (!workerId || !workerName || !shift) {
        return res.status(400).json({ message: 'Worker ID, name, and shift are required' });
      }

      // Convert image to base64
      const imageData = req.file.buffer.toString('base64');

      // Analyze image with Gemini AI
      let analysis;
      try {
        analysis = await analyzeSafetyImage(req.file.buffer);
      } catch (error) {
        console.error('Gemini analysis failed:', error);
        return res.status(500).json({ message: 'AI analysis failed. Please check your API configuration.' });
      }

      // Create assessment record
      const assessmentData = {
        workerId,
        workerName,
        shift,
        imageData,
        status: analysis.overallStatus,
        confidence: analysis.confidence,
        aiAnalysis: analysis,
        criteria: analysis.criteria,
      };

      const validatedData = insertAssessmentSchema.parse(assessmentData);
      const assessment = await storage.createAssessment(validatedData);

      res.json(assessment);
    } catch (error) {
      console.error('Assessment creation failed:', error);
      res.status(500).json({ message: 'Failed to create assessment' });
    }
  });

  // Get all assessments
  app.get('/api/assessments', async (req, res) => {
    try {
      const assessments = await storage.getAllAssessments();
      res.json(assessments);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      res.status(500).json({ message: 'Failed to fetch assessments' });
    }
  });

  // Get assessment by ID
  app.get('/api/assessments/:id', async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }
      res.json(assessment);
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
      res.status(500).json({ message: 'Failed to fetch assessment' });
    }
  });

  // Update assessment (for admin review)
  app.patch('/api/assessments/:id', async (req, res) => {
    try {
      const updateData = updateAssessmentSchema.parse({
        id: req.params.id,
        ...req.body,
      });

      const assessment = await storage.updateAssessment(updateData);
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      res.json(assessment);
    } catch (error) {
      console.error('Failed to update assessment:', error);
      res.status(500).json({ message: 'Failed to update assessment' });
    }
  });

  // Get flagged assessments
  app.get('/api/assessments/status/flagged', async (req, res) => {
    try {
      const flaggedAssessments = await storage.getFlaggedAssessments();
      res.json(flaggedAssessments);
    } catch (error) {
      console.error('Failed to fetch flagged assessments:', error);
      res.status(500).json({ message: 'Failed to fetch flagged assessments' });
    }
  });

  // Get today's statistics
  app.get('/api/stats/today', async (req, res) => {
    try {
      const todayAssessments = await storage.getTodayAssessments();
      
      const stats = {
        total: todayAssessments.length,
        passed: todayAssessments.filter(a => a.status === 'passed').length,
        flagged: todayAssessments.filter(a => a.status === 'flagged').length,
        rejected: todayAssessments.filter(a => a.status === 'rejected').length,
        avgConfidence: todayAssessments.length > 0 
          ? todayAssessments.reduce((sum, a) => sum + a.confidence, 0) / todayAssessments.length 
          : 0,
        successRate: todayAssessments.length > 0 
          ? (todayAssessments.filter(a => a.status === 'passed').length / todayAssessments.length) * 100 
          : 0,
      };

      res.json(stats);
    } catch (error) {
      console.error('Failed to fetch today statistics:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
