import { z } from "zod";

export const profileSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  age: z.number()
    .int("Age must be a whole number")
    .min(0, "Age must be positive")
    .max(150, "Age must be less than 150"),
  gender: z.string().optional(),
  married_status: z.string().optional(),
  location: z.string()
    .trim()
    .max(200, "Location must be less than 200 characters")
    .optional(),
  preferred_language: z.string()
    .trim()
    .max(50, "Language must be less than 50 characters")
    .optional(),
  medical_category: z.string()
    .trim()
    .max(500, "Medical category must be less than 500 characters")
    .optional(),
});

export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(50000, "Message must be less than 50000 characters"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
