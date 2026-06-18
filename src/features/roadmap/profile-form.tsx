"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  profileFormSchema,
  defaultProfileValues,
  deriveExperienceLevel,
  type ProfileFormValues,
} from "./profile-schema";
import { getAvailableCertifications, getCertificationOrThrow } from "@/constants/certifications";
import { useRoadmapStore } from "@/store/roadmap-store";
import { useSettingsStore } from "@/store/settings-store";
import { FRIENDLY_MESSAGES, AIError } from "@/services/ai/errors";
import type { UserProfile } from "@/types";

export function ProfileForm({ defaultCertId }: { defaultCertId: string }) {
  const router = useRouter();
  const generate = useRoadmapStore((s) => s.generate);
  const generating = useRoadmapStore((s) => s.generating);
  const progress = useRoadmapStore((s) => s.progress);
  const { settings, setActiveRoadmap } = useSettingsStore();
  const certs = getAvailableCertifications();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { ...defaultProfileValues, certificationId: defaultCertId },
  });

  const certificationId = watch("certificationId");
  const cert = certificationId ? getCertificationOrThrow(certificationId) : null;

  async function onSubmit(values: ProfileFormValues) {
    if (!settings.apiKey) {
      toast.error("No API key", "Add your provider key in Settings first.");
      router.push("/settings");
      return;
    }
    const profile: UserProfile = {
      yearsExperience: values.yearsExperience,
      currentRole: values.currentRole,
      knowledgeLevel: values.knowledgeLevel,
      experienceLevel: deriveExperienceLevel(values.yearsExperience, values.knowledgeLevel),
      dailyStudyHours: values.dailyStudyHours,
      targetExamDate: values.targetExamDate,
      certificationId: values.certificationId,
      goalScore: values.goalScore,
      notes: values.notes,
    };
    try {
      const roadmap = await generate(profile, settings);
      await setActiveRoadmap(roadmap.id);
      toast.success("Roadmap ready!", `${roadmap.totalDays}-day plan generated.`);
      router.push("/roadmap");
    } catch (err) {
      const e = err as AIError;
      toast.error("Generation failed", FRIENDLY_MESSAGES[e.code] ?? e.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Tell us about you
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Certification</Label>
            <Select
              value={certificationId}
              onValueChange={(v) => setValue("certificationId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a certification" />
              </SelectTrigger>
              <SelectContent>
                {certs.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Years of experience" error={errors.yearsExperience?.message}>
              <Input type="number" step="1" min={0} {...register("yearsExperience")} />
            </Field>
            <Field label="Current role" error={errors.currentRole?.message}>
              <Input placeholder="e.g. Backend Developer" {...register("currentRole")} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Knowledge level" error={errors.knowledgeLevel?.message}>
              <Select
                value={watch("knowledgeLevel")}
                onValueChange={(v) => setValue("knowledgeLevel", v as ProfileFormValues["knowledgeLevel"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None — brand new</SelectItem>
                  <SelectItem value="basic">Basic familiarity</SelectItem>
                  <SelectItem value="moderate">Moderate hands-on</SelectItem>
                  <SelectItem value="strong">Strong / professional</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Daily study hours" error={errors.dailyStudyHours?.message}>
              <Input type="number" step="0.5" min={0.5} {...register("dailyStudyHours")} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Target exam date" error={errors.targetExamDate?.message}>
              <Input type="date" {...register("targetExamDate")} />
            </Field>
            <Field
              label={`Goal score (max ${cert?.exam.maxScore ?? 1000})`}
              error={errors.goalScore?.message}
            >
              <Input type="number" step="10" {...register("goalScore")} />
            </Field>
          </div>

          <Field label="Focus areas / notes (optional)" error={errors.notes?.message}>
            <Textarea
              placeholder="Anything you want the plan to emphasize…"
              {...register("notes")}
            />
          </Field>

          <Button
            type="submit"
            size="lg"
            variant="gradient"
            className="w-full"
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {progress || "Generating your roadmap…"}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Generate My Roadmap
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
