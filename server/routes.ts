import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertForumTopicSchema,
  insertForumCommentSchema,
  insertBehaviorReflectionSchema,
  insertMealSchema,
  insertWeightEntrySchema,
} from "@shared/schema";
import { generateInsights } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Course routes
  app.get('/api/courses/modules', isAuthenticated, async (req, res) => {
    try {
      const modules = await storage.getCourseModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      res.status(500).json({ message: "Failed to fetch course modules" });
    }
  });

  app.get('/api/courses/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.post('/api/courses/complete/:moduleId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moduleId = parseInt(req.params.moduleId);
      const progress = await storage.markModuleComplete(userId, moduleId);
      res.json(progress);
    } catch (error) {
      console.error("Error marking module complete:", error);
      res.status(500).json({ message: "Failed to mark module complete" });
    }
  });

  // Forum routes
  app.get('/api/forum/topics', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const topics = await storage.getForumTopics(limit);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching forum topics:", error);
      res.status(500).json({ message: "Failed to fetch forum topics" });
    }
  });

  app.get('/api/forum/topics/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const topic = await storage.getForumTopic(id);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.json(topic);
    } catch (error) {
      console.error("Error fetching forum topic:", error);
      res.status(500).json({ message: "Failed to fetch forum topic" });
    }
  });

  app.post('/api/forum/topics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const topicData = insertForumTopicSchema.parse({ ...req.body, userId });
      const topic = await storage.createForumTopic(topicData);
      res.json(topic);
    } catch (error) {
      console.error("Error creating forum topic:", error);
      res.status(500).json({ message: "Failed to create forum topic" });
    }
  });

  app.get('/api/forum/topics/:id/comments', isAuthenticated, async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const comments = await storage.getTopicComments(topicId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching topic comments:", error);
      res.status(500).json({ message: "Failed to fetch topic comments" });
    }
  });

  app.post('/api/forum/topics/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const topicId = parseInt(req.params.id);
      const commentData = insertForumCommentSchema.parse({ ...req.body, userId, topicId });
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post('/api/forum/topics/:id/like', isAuthenticated, async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      await storage.likeForumTopic(topicId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking topic:", error);
      res.status(500).json({ message: "Failed to like topic" });
    }
  });

  app.post('/api/forum/comments/:id/like', isAuthenticated, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      await storage.likeComment(commentId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking comment:", error);
      res.status(500).json({ message: "Failed to like comment" });
    }
  });

  // Exercise routes
  app.get('/api/exercises/daily', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      
      // Generate daily exercises if they don't exist
      const exercises = await storage.generateDailyExercises(userId, date);
      const dailyExercises = await storage.getDailyExercises(userId, date);
      
      res.json(dailyExercises);
    } catch (error) {
      console.error("Error fetching daily exercises:", error);
      res.status(500).json({ message: "Failed to fetch daily exercises" });
    }
  });

  app.post('/api/exercises/:id/answer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exerciseId = parseInt(req.params.id);
      const { answer, date } = req.body;
      
      const result = await storage.submitExerciseAnswer(exerciseId, userId, answer, date);
      res.json(result);
    } catch (error) {
      console.error("Error submitting exercise answer:", error);
      res.status(500).json({ message: "Failed to submit exercise answer" });
    }
  });

  // Behavior reflection routes
  app.get('/api/reflections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      const reflection = await storage.getBehaviorReflection(userId, date);
      res.json(reflection);
    } catch (error) {
      console.error("Error fetching behavior reflection:", error);
      res.status(500).json({ message: "Failed to fetch behavior reflection" });
    }
  });

  app.post('/api/reflections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reflectionData = insertBehaviorReflectionSchema.parse({ ...req.body, userId });
      const reflection = await storage.createBehaviorReflection(reflectionData);
      res.json(reflection);
    } catch (error) {
      console.error("Error creating behavior reflection:", error);
      res.status(500).json({ message: "Failed to create behavior reflection" });
    }
  });

  app.put('/api/reflections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const reflectionData = req.body;
      const reflection = await storage.updateBehaviorReflection(id, reflectionData);
      res.json(reflection);
    } catch (error) {
      console.error("Error updating behavior reflection:", error);
      res.status(500).json({ message: "Failed to update behavior reflection" });
    }
  });

  // Meal routes
  app.get('/api/meals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string;
      const meals = await storage.getMeals(userId, date);
      res.json(meals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });

  app.get('/api/meals/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 5;
      const meals = await storage.getRecentMeals(userId, limit);
      res.json(meals);
    } catch (error) {
      console.error("Error fetching recent meals:", error);
      res.status(500).json({ message: "Failed to fetch recent meals" });
    }
  });

  app.post('/api/meals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mealData = insertMealSchema.parse({ ...req.body, userId });
      const meal = await storage.createMeal(mealData);
      res.json(meal);
    } catch (error) {
      console.error("Error creating meal:", error);
      res.status(500).json({ message: "Failed to create meal" });
    }
  });

  // Weight tracking routes
  app.get('/api/weight', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 30;
      const entries = await storage.getWeightEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      res.status(500).json({ message: "Failed to fetch weight entries" });
    }
  });

  app.post('/api/weight', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertWeightEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createWeightEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating weight entry:", error);
      res.status(500).json({ message: "Failed to create weight entry" });
    }
  });

  // Points routes
  app.get('/api/points/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getPointsHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching points history:", error);
      res.status(500).json({ message: "Failed to fetch points history" });
    }
  });

  // AI Insights routes
  app.get('/api/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user data for insights
      const [stats, weightEntries, meals, reflections] = await Promise.all([
        storage.getDashboardStats(userId),
        storage.getWeightEntries(userId, 7), // Last 7 days
        storage.getMeals(userId), // All meals
        storage.getBehaviorReflection(userId, new Date().toISOString().split('T')[0]) // Today's reflection
      ]);

      const insights = await generateInsights({
        stats,
        weightEntries,
        meals: meals.slice(0, 10), // Last 10 meals
        reflection: reflections,
      });

      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
