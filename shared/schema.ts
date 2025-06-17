import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  currentWeight: decimal("current_weight", { precision: 5, scale: 2 }),
  targetWeight: decimal("target_weight", { precision: 5, scale: 2 }),
  totalPoints: integer("total_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: varchar("video_url", { length: 500 }),
  duration: integer("duration"), // in minutes
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: integer("module_id").notNull().references(() => courseModules.id),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => forumTopics.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: varchar("answer", { length: 100 }),
  options: jsonb("options"),
  correctOption: integer("correct_option"),
  category: varchar("category", { length: 50 }),
  difficulty: integer("difficulty").default(1), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyExercises = pgTable("daily_exercises", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  date: date("date").notNull(),
  userAnswer: varchar("user_answer", { length: 100 }),
  correct: boolean("correct"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const behaviorReflections = pgTable("behavior_reflections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  moodRating: integer("mood_rating"), // 1-5
  hungerLevel: integer("hunger_level"), // 1-5
  stressLevel: integer("stress_level"), // 1-5
  exerciseMinutes: integer("exercise_minutes"),
  challenges: text("challenges"),
  achievements: text("achievements"),
  notes: text("notes"),
  drankEnoughWater: boolean("drank_enough_water"),
  ateMindfully: boolean("ate_mindfully"),
  exercisedToday: boolean("exercised_today"),
  sleptWell: boolean("slept_well"),
  managedStress: boolean("managed_stress"),
  avoidedEmotionalEating: boolean("avoided_emotional_eating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // breakfast, lunch, dinner, snack, supper
  time: varchar("time", { length: 5 }).notNull(), // HH:MM format
  foods: text("foods").notNull(),
  calories: integer("calories"),
  date: date("date").notNull(),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weightEntries = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  photoUrl: varchar("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  activity: varchar("activity", { length: 100 }).notNull(),
  points: integer("points").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  topics: many(forumTopics),
  comments: many(forumComments),
  dailyExercises: many(dailyExercises),
  reflections: many(behaviorReflections),
  meals: many(meals),
  weightEntries: many(weightEntries),
  pointsHistory: many(pointsHistory),
}));

export const courseModuleRelations = relations(courseModules, ({ many }) => ({
  progress: many(userProgress),
}));

export const forumTopicRelations = relations(forumTopics, ({ one, many }) => ({
  user: one(users, {
    fields: [forumTopics.userId],
    references: [users.id],
  }),
  comments: many(forumComments),
}));

export const forumCommentRelations = relations(forumComments, ({ one }) => ({
  topic: one(forumTopics, {
    fields: [forumComments.topicId],
    references: [forumTopics.id],
  }),
  user: one(users, {
    fields: [forumComments.userId],
    references: [users.id],
  }),
}));

export const exerciseRelations = relations(exercises, ({ many }) => ({
  dailyExercises: many(dailyExercises),
}));

export const dailyExerciseRelations = relations(dailyExercises, ({ one }) => ({
  user: one(users, {
    fields: [dailyExercises.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [dailyExercises.exerciseId],
    references: [exercises.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumCommentSchema = createInsertSchema(forumComments).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertDailyExerciseSchema = createInsertSchema(dailyExercises).omit({
  id: true,
  createdAt: true,
});

export const insertBehaviorReflectionSchema = createInsertSchema(behaviorReflections).omit({
  id: true,
  createdAt: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  points: true,
  createdAt: true,
});

export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type DailyExercise = typeof dailyExercises.$inferSelect;
export type InsertDailyExercise = z.infer<typeof insertDailyExerciseSchema>;
export type BehaviorReflection = typeof behaviorReflections.$inferSelect;
export type InsertBehaviorReflection = z.infer<typeof insertBehaviorReflectionSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
export type PointsHistory = typeof pointsHistory.$inferSelect;
