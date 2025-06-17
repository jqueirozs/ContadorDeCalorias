import {
  users,
  courseModules,
  userProgress,
  forumTopics,
  forumComments,
  exercises,
  dailyExercises,
  behaviorReflections,
  meals,
  weightEntries,
  pointsHistory,
  type User,
  type UpsertUser,
  type CourseModule,
  type InsertCourseModule,
  type UserProgress,
  type ForumTopic,
  type InsertForumTopic,
  type ForumComment,
  type InsertForumComment,
  type Exercise,
  type InsertExercise,
  type DailyExercise,
  type InsertDailyExercise,
  type BehaviorReflection,
  type InsertBehaviorReflection,
  type Meal,
  type InsertMeal,
  type WeightEntry,
  type InsertWeightEntry,
  type PointsHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Course operations
  getCourseModules(): Promise<CourseModule[]>;
  getUserProgress(userId: string): Promise<UserProgress[]>;
  markModuleComplete(userId: string, moduleId: number): Promise<UserProgress>;
  
  // Forum operations
  getForumTopics(limit?: number): Promise<(ForumTopic & { user: User; commentCount: number })[]>;
  getForumTopic(id: number): Promise<(ForumTopic & { user: User }) | undefined>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  getTopicComments(topicId: number): Promise<(ForumComment & { user: User })[]>;
  createComment(comment: InsertForumComment): Promise<ForumComment>;
  likeForumTopic(topicId: number): Promise<void>;
  likeComment(commentId: number): Promise<void>;
  
  // Exercise operations
  getExercises(): Promise<Exercise[]>;
  getDailyExercises(userId: string, date: string): Promise<(DailyExercise & { exercise: Exercise })[]>;
  generateDailyExercises(userId: string, date: string): Promise<DailyExercise[]>;
  submitExerciseAnswer(exerciseId: number, userId: string, answer: string, date: string): Promise<DailyExercise>;
  
  // Behavior reflection operations
  getBehaviorReflection(userId: string, date: string): Promise<BehaviorReflection | undefined>;
  createBehaviorReflection(reflection: InsertBehaviorReflection): Promise<BehaviorReflection>;
  updateBehaviorReflection(id: number, reflection: Partial<InsertBehaviorReflection>): Promise<BehaviorReflection>;
  
  // Meal operations
  getMeals(userId: string, date?: string): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  getRecentMeals(userId: string, limit?: number): Promise<Meal[]>;
  
  // Weight tracking operations
  getWeightEntries(userId: string, limit?: number): Promise<WeightEntry[]>;
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  getLatestWeight(userId: string): Promise<WeightEntry | undefined>;
  
  // Points operations
  addPoints(userId: string, activity: string, points: number, date: string): Promise<void>;
  getPointsHistory(userId: string, limit?: number): Promise<PointsHistory[]>;
  getUserTotalPoints(userId: string): Promise<number>;
  
  // Dashboard data
  getDashboardStats(userId: string): Promise<{
    currentWeight: number | null;
    totalPoints: number;
    exercisesCompleted: number;
    mealsToday: number;
    reflectionCompleted: boolean;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getCourseModules(): Promise<CourseModule[]> {
    return await db.select().from(courseModules).orderBy(courseModules.order);
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async markModuleComplete(userId: string, moduleId: number): Promise<UserProgress> {
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId)));

    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({ completed: true, completedAt: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      
      // Award points for completing module
      await this.addPoints(userId, "Módulo concluído", 50, new Date().toISOString().split('T')[0]);
      
      return updated;
    } else {
      const [newProgress] = await db
        .insert(userProgress)
        .values({
          userId,
          moduleId,
          completed: true,
          completedAt: new Date(),
        })
        .returning();
      
      // Award points for completing module
      await this.addPoints(userId, "Módulo concluído", 50, new Date().toISOString().split('T')[0]);
      
      return newProgress;
    }
  }

  // Forum operations
  async getForumTopics(limit = 20): Promise<(ForumTopic & { user: User; commentCount: number })[]> {
    const topicsWithUsers = await db
      .select({
        id: forumTopics.id,
        userId: forumTopics.userId,
        title: forumTopics.title,
        content: forumTopics.content,
        likes: forumTopics.likes,
        createdAt: forumTopics.createdAt,
        updatedAt: forumTopics.updatedAt,
        user: users,
        commentCount: sql<number>`count(${forumComments.id})`,
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.userId, users.id))
      .leftJoin(forumComments, eq(forumTopics.id, forumComments.topicId))
      .groupBy(forumTopics.id, users.id)
      .orderBy(desc(forumTopics.createdAt))
      .limit(limit);

    return topicsWithUsers;
  }

  async getForumTopic(id: number): Promise<(ForumTopic & { user: User }) | undefined> {
    const [topic] = await db
      .select({
        id: forumTopics.id,
        userId: forumTopics.userId,
        title: forumTopics.title,
        content: forumTopics.content,
        likes: forumTopics.likes,
        createdAt: forumTopics.createdAt,
        updatedAt: forumTopics.updatedAt,
        user: users,
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.userId, users.id))
      .where(eq(forumTopics.id, id));

    return topic;
  }

  async createForumTopic(topic: InsertForumTopic): Promise<ForumTopic> {
    const [newTopic] = await db.insert(forumTopics).values(topic).returning();
    
    // Award points for creating topic
    await this.addPoints(topic.userId, "Tópico criado", 20, new Date().toISOString().split('T')[0]);
    
    return newTopic;
  }

  async getTopicComments(topicId: number): Promise<(ForumComment & { user: User })[]> {
    return await db
      .select({
        id: forumComments.id,
        topicId: forumComments.topicId,
        userId: forumComments.userId,
        content: forumComments.content,
        likes: forumComments.likes,
        createdAt: forumComments.createdAt,
        user: users,
      })
      .from(forumComments)
      .leftJoin(users, eq(forumComments.userId, users.id))
      .where(eq(forumComments.topicId, topicId))
      .orderBy(forumComments.createdAt);
  }

  async createComment(comment: InsertForumComment): Promise<ForumComment> {
    const [newComment] = await db.insert(forumComments).values(comment).returning();
    
    // Award points for commenting
    await this.addPoints(comment.userId, "Comentário criado", 10, new Date().toISOString().split('T')[0]);
    
    return newComment;
  }

  async likeForumTopic(topicId: number): Promise<void> {
    await db
      .update(forumTopics)
      .set({ likes: sql`${forumTopics.likes} + 1` })
      .where(eq(forumTopics.id, topicId));
  }

  async likeComment(commentId: number): Promise<void> {
    await db
      .update(forumComments)
      .set({ likes: sql`${forumComments.likes} + 1` })
      .where(eq(forumComments.id, commentId));
  }

  // Exercise operations
  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  async getDailyExercises(userId: string, date: string): Promise<(DailyExercise & { exercise: Exercise })[]> {
    return await db
      .select({
        id: dailyExercises.id,
        userId: dailyExercises.userId,
        exerciseId: dailyExercises.exerciseId,
        date: dailyExercises.date,
        userAnswer: dailyExercises.userAnswer,
        correct: dailyExercises.correct,
        completedAt: dailyExercises.completedAt,
        createdAt: dailyExercises.createdAt,
        exercise: exercises,
      })
      .from(dailyExercises)
      .leftJoin(exercises, eq(dailyExercises.exerciseId, exercises.id))
      .where(and(eq(dailyExercises.userId, userId), eq(dailyExercises.date, date)))
      .orderBy(dailyExercises.id);
  }

  async generateDailyExercises(userId: string, date: string): Promise<DailyExercise[]> {
    // Check if exercises already exist for this date
    const existing = await this.getDailyExercises(userId, date);
    if (existing.length > 0) {
      return existing;
    }

    // Get 10 random exercises
    const allExercises = await db.select().from(exercises);
    const randomExercises = allExercises
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(10, allExercises.length));

    // Create daily exercises
    const dailyExerciseValues = randomExercises.map(exercise => ({
      userId,
      exerciseId: exercise.id,
      date,
    }));

    const newDailyExercises = await db
      .insert(dailyExercises)
      .values(dailyExerciseValues)
      .returning();

    return newDailyExercises;
  }

  async submitExerciseAnswer(exerciseId: number, userId: string, answer: string, date: string): Promise<DailyExercise> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, exerciseId));
    
    let correct = false;
    if (exercise?.correctOption !== null && exercise?.correctOption !== undefined) {
      // Multiple choice question
      const index = parseInt(answer);
      if (!isNaN(index) && Array.isArray(exercise.options)) {
        correct = index === exercise.correctOption;
      }
    } else if (exercise?.answer) {
      // Text-based question
      correct = exercise.answer.toLowerCase() === answer.toLowerCase();
    }

    const [updated] = await db
      .update(dailyExercises)
      .set({
        userAnswer: answer,
        correct,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(dailyExercises.userId, userId),
          eq(dailyExercises.exerciseId, exerciseId),
          eq(dailyExercises.date, date)
        )
      )
      .returning();

    // Award points for completing exercise
    if (correct) {
      await this.addPoints(userId, "Exercício correto", 15, date);
    } else {
      await this.addPoints(userId, "Exercício tentado", 5, date);
    }

    return updated;
  }

  // Behavior reflection operations
  async getBehaviorReflection(userId: string, date: string): Promise<BehaviorReflection | undefined> {
    const [reflection] = await db
      .select()
      .from(behaviorReflections)
      .where(and(eq(behaviorReflections.userId, userId), eq(behaviorReflections.date, date)));
    return reflection;
  }

  async createBehaviorReflection(reflection: InsertBehaviorReflection): Promise<BehaviorReflection> {
    const [newReflection] = await db.insert(behaviorReflections).values(reflection).returning();
    
    // Award points for completing reflection
    await this.addPoints(reflection.userId, "Espelho preenchido", 30, reflection.date);
    
    return newReflection;
  }

  async updateBehaviorReflection(id: number, reflection: Partial<InsertBehaviorReflection>): Promise<BehaviorReflection> {
    const [updated] = await db
      .update(behaviorReflections)
      .set(reflection)
      .where(eq(behaviorReflections.id, id))
      .returning();
    return updated;
  }

  // Meal operations
  async getMeals(userId: string, date?: string): Promise<Meal[]> {
    let query = db.select().from(meals).where(eq(meals.userId, userId));
    
    if (date) {
      query = query.where(and(eq(meals.userId, userId), eq(meals.date, date)));
    }
    
    return await query.orderBy(desc(meals.createdAt));
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    // Calculate points based on meal type
    const pointsMap: Record<string, number> = {
      breakfast: 20,
      lunch: 25,
      dinner: 25,
      snack: 15,
      supper: 15,
    };

    const points = pointsMap[meal.type] || 10;

    const [newMeal] = await db
      .insert(meals)
      .values({ ...meal, points })
      .returning();
    
    // Award points for registering meal
    await this.addPoints(meal.userId, `Refeição registrada: ${meal.type}`, points, meal.date);
    
    return newMeal;
  }

  async getRecentMeals(userId: string, limit = 5): Promise<Meal[]> {
    return await db
      .select()
      .from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(desc(meals.createdAt))
      .limit(limit);
  }

  // Weight tracking operations
  async getWeightEntries(userId: string, limit = 30): Promise<WeightEntry[]> {
    return await db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.userId, userId))
      .orderBy(desc(weightEntries.date))
      .limit(limit);
  }

  async createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry> {
    const [newEntry] = await db.insert(weightEntries).values(entry).returning();
    
    // Update user's current weight
    await db
      .update(users)
      .set({ currentWeight: entry.weight, updatedAt: new Date() })
      .where(eq(users.id, entry.userId));
    
    // Award points for tracking weight
    await this.addPoints(entry.userId, "Peso registrado", 25, entry.date);
    
    return newEntry;
  }

  async getLatestWeight(userId: string): Promise<WeightEntry | undefined> {
    const [latest] = await db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.userId, userId))
      .orderBy(desc(weightEntries.date))
      .limit(1);
    return latest;
  }

  // Points operations
  async addPoints(userId: string, activity: string, points: number, date: string): Promise<void> {
    // Add to points history
    await db.insert(pointsHistory).values({
      userId,
      activity,
      points,
      date,
    });

    // Update user's total points
    await db
      .update(users)
      .set({
        totalPoints: sql`${users.totalPoints} + ${points}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getPointsHistory(userId: string, limit = 50): Promise<PointsHistory[]> {
    return await db
      .select()
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))
      .orderBy(desc(pointsHistory.createdAt))
      .limit(limit);
  }

  async getUserTotalPoints(userId: string): Promise<number> {
    const [user] = await db
      .select({ totalPoints: users.totalPoints })
      .from(users)
      .where(eq(users.id, userId));
    return user?.totalPoints || 0;
  }

  // Dashboard data
  async getDashboardStats(userId: string): Promise<{
    currentWeight: number | null;
    totalPoints: number;
    exercisesCompleted: number;
    mealsToday: number;
    reflectionCompleted: boolean;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get user data
    const [user] = await db
      .select({
        currentWeight: users.currentWeight,
        totalPoints: users.totalPoints,
      })
      .from(users)
      .where(eq(users.id, userId));

    // Get today's completed exercises
    const completedExercises = await db
      .select()
      .from(dailyExercises)
      .where(
        and(
          eq(dailyExercises.userId, userId),
          eq(dailyExercises.date, today),
          sql`${dailyExercises.completedAt} IS NOT NULL`
        )
      );

    // Get today's meals
    const todayMeals = await db
      .select()
      .from(meals)
      .where(and(eq(meals.userId, userId), eq(meals.date, today)));

    // Check if reflection is completed
    const reflection = await this.getBehaviorReflection(userId, today);

    return {
      currentWeight: user?.currentWeight ? parseFloat(user.currentWeight) : null,
      totalPoints: user?.totalPoints || 0,
      exercisesCompleted: completedExercises.length,
      mealsToday: todayMeals.length,
      reflectionCompleted: !!reflection,
    };
  }
}

export const storage = new DatabaseStorage();
