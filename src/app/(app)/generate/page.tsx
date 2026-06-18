"use client";

import * as React from "react";
import { CheckCircle2, Clock, FileText, Target } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequireApiKey } from "@/components/shared/require-api-key";
import { ProfileForm } from "@/features/roadmap/profile-form";
import { DEFAULT_CERTIFICATION_ID, getCertificationOrThrow } from "@/constants/certifications";

export default function GeneratePage() {
  const cert = getCertificationOrThrow(DEFAULT_CERTIFICATION_ID);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate your roadmap"
        description="Answer a few questions and we'll build a personalized, day-by-day study plan."
      />
      <RequireApiKey>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProfileForm defaultCertId={cert.id} />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What you&apos;ll get</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  {[
                    "Month, week & day breakdown",
                    "Topics, objectives & hands-on labs",
                    "Daily revision & practice targets",
                    "Exam tips tailored to your level",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> {cert.code}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    <FileText className="mr-1 inline h-3.5 w-3.5" /> Questions
                  </span>
                  <span>{cert.exam.questionCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    <Clock className="mr-1 inline h-3.5 w-3.5" /> Duration
                  </span>
                  <span>{cert.exam.durationMinutes} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pass score</span>
                  <span>
                    {cert.exam.passingScore}/{cert.exam.maxScore}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cert.domains.map((d) => (
                    <Badge key={d.id} variant="secondary" className="text-[11px]">
                      {d.name} · {d.weightage}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireApiKey>
    </div>
  );
}
