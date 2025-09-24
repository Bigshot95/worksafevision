import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: text("worker_id").notNull(),
  workerName: text("worker_name").notNull(),
  shift: text("shift").notNull(),
  imageData: text("image_data").notNull(), // base64 encoded image
  status: text("status").notNull(), // "passed", "flagged", "rejected"
  confidence: real("confidence").notNull(),
  aiAnalysis: json("ai_analysis"), // detailed AI analysis results
  criteria: json("criteria"), // individual criteria scores
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export const updateAssessmentSchema = insertAssessmentSchema.partial().extend({
  id: z.string(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type UpdateAssessment = z.infer<typeof updateAssessmentSchema>;

// AI Analysis result interface
export interface SafetyAnalysis {
  overallStatus: "passed" | "flagged";
  confidence: number;
  criteria: {
    eyeMovement: { score: number; status: "normal" | "abnormal" };
    facialExpression: { score: number; status: "normal" | "abnormal" };
    headPosition: { score: number; status: "stable" | "unstable" };
    skinColor: { score: number; status: "normal" | "abnormal" };
  };
  detectedIssues: string[];
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
}
