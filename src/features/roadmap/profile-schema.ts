import { z } from "zod";
import { addDays, formatISO } from "date-fns";
import type { ExperienceLevel } from "@/types";

export const profileFormSchema = z.object({
  certificationId: z.string().min(1, "Pick a certification"),
  yearsExperience: z.coerce.number().min(0).max(50),
  currentRole: z.string().min(2, "Tell us your role").max(80),
  knowledgeLevel: z.enum(["none", "basic", "moderate", "strong"]),
  dailyStudyHours: z.coerce.number().min(0.5, "At least 0.5h").max(16),
  targetExamDate: z
    .string()
    .refine((d) => new Date(d).getTime() > Date.now(), "Pick a future date"),
  goalScore: z.coerce.number().min(0).max(1000),
  notes: z.string().max(500).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/** Derive a coarse experience tier from years + self-rated knowledge. */
export function deriveExperienceLevel(
  years: number,
  knowledge: ProfileFormValues["knowledgeLevel"],
): ExperienceLevel {
  if (years >= 5 || knowledge === "strong") return "advanced";
  if (years >= 2 || knowledge === "moderate") return "intermediate";
  return "beginner";
}

export const defaultProfileValues: Partial<ProfileFormValues> = {
  yearsExperience: 2,
  currentRole: "",
  knowledgeLevel: "basic",
  dailyStudyHours: 2,
  targetExamDate: formatISO(addDays(new Date(), 60), { representation: "date" }),
  goalScore: 800,
  notes: "",
};
