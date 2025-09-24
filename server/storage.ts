import { type Assessment, type InsertAssessment, type UpdateAssessment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Assessment methods
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAllAssessments(): Promise<Assessment[]>;
  updateAssessment(assessment: UpdateAssessment): Promise<Assessment | undefined>;
  getFlaggedAssessments(): Promise<Assessment[]>;
  getTodayAssessments(): Promise<Assessment[]>;
  getAssessmentsByStatus(status: string): Promise<Assessment[]>;
}

export class MemStorage implements IStorage {
  private assessments: Map<string, Assessment>;

  constructor() {
    this.assessments = new Map();
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = {
      ...insertAssessment,
      id,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      aiAnalysis: insertAssessment.aiAnalysis || null,
      criteria: insertAssessment.criteria || null,
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAllAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateAssessment(updateData: UpdateAssessment): Promise<Assessment | undefined> {
    const existing = this.assessments.get(updateData.id);
    if (!existing) return undefined;

    const updated: Assessment = {
      ...existing,
      ...updateData,
    };
    this.assessments.set(updateData.id, updated);
    return updated;
  }

  async getFlaggedAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values())
      .filter(assessment => assessment.status === "flagged")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTodayAssessments(): Promise<Assessment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.assessments.values())
      .filter(assessment => assessment.createdAt >= today)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAssessmentsByStatus(status: string): Promise<Assessment[]> {
    return Array.from(this.assessments.values())
      .filter(assessment => assessment.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
