"use client";

import * as React from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useRoadmapStore } from "@/store/roadmap-store";
import { getCertification } from "@/constants/certifications";

export function ActiveCertBadge() {
  const active = useRoadmapStore((s) => s.active);
  if (!active) return null;
  const cert = getCertification(active.certificationId);
  const days = Math.max(
    0,
    differenceInCalendarDays(parseISO(active.profile.targetExamDate), new Date()),
  );
  return (
    <Badge variant="secondary" className="hidden gap-1.5 sm:inline-flex">
      <span className="font-semibold">{cert?.code ?? "Cert"}</span>
      <span className="text-muted-foreground">· {days}d left</span>
    </Badge>
  );
}
