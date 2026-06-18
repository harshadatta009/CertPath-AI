import type {
  RoadmapRequest,
  QuestionRequest,
  FlashcardRequest,
  CheatSheetRequest,
  InterviewRequest,
  RevisionRequest,
} from "./types";
import type { CertificationConfig } from "@/types";

/**
 * Prompt construction. Every prompt forces structured JSON only — never
 * markdown — and embeds the certification's real domain ids so the model's
 * output maps cleanly onto our config (and analytics).
 */

const JSON_RULES = `You are an expert certification coach and curriculum designer.
Respond with a SINGLE valid JSON object and nothing else.
Do not include markdown, code fences, comments, or prose outside the JSON.
Every field in the requested schema must be present. Use the exact domainId values provided.`;

function certContext(cert: CertificationConfig): string {
  const domains = cert.domains
    .map(
      (d) =>
        `- domainId "${d.id}" — ${d.name} (${d.weightage}% of exam). Topics: ${d.topics
          .map((t) => t.name)
          .join(", ")}`,
    )
    .join("\n");
  return `Certification: ${cert.name} (${cert.code}).
Exam: ${cert.exam.questionCount} questions, pass ${cert.exam.passingScore}/${cert.exam.maxScore}.
Domains and valid domainId values:
${domains}`;
}

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export function roadmapPrompt(req: RoadmapRequest): ChatMessage[] {
  const { profile, certification, totalDays } = req;
  const weeks = Math.ceil(totalDays / 7);
  const months = Math.ceil(totalDays / 30);
  return [
    { role: "system", content: JSON_RULES },
    {
      role: "user",
      content: `${certContext(certification)}

Build a personalized study roadmap.
Learner profile:
- Experience: ${profile.yearsExperience} years as ${profile.currentRole}
- Experience tier: ${profile.experienceLevel}
- Prior knowledge of this domain: ${profile.knowledgeLevel}
- Daily study time: ${profile.dailyStudyHours} hours
- Days until exam: ${totalDays} (${weeks} weeks, ~${months} month(s))
- Goal score: ${profile.goalScore}/${certification.exam.maxScore}
${profile.notes ? `- Focus notes: ${profile.notes}` : ""}

Requirements:
- Produce EXACTLY ${totalDays} entries in "days", dayNumber 1..${totalDays}.
- Daily estimatedHours should respect the learner's ${profile.dailyStudyHours}h/day budget.
- Allocate days across domains proportional to their exam weightage.
- Front-load fundamentals; schedule revision days and a final review week.
- Each day: concrete topics, measurable objectives, hands-on labs, revision topics, practice question counts and exam tips.
- Provide "weeks" (one per week) and "months" (one per month) summaries.

Return JSON shaped exactly as:
{
  "title": string,
  "summary": string,
  "months": [{ "monthNumber": number, "title": string, "theme": string, "milestone": string }],
  "weeks": [{ "weekNumber": number, "title": string, "theme": string, "focusDomainIds": string[], "goals": string[] }],
  "days": [{ "dayNumber": number, "title": string, "domainId": string, "topics": string[], "objectives": string[], "estimatedHours": number, "labs": [{ "title": string, "description": string, "estimatedMinutes": number }], "revisionTopics": string[], "practiceQuestions": number, "examTips": string[] }]
}`,
    },
  ];
}

export function questionsPrompt(req: QuestionRequest): ChatMessage[] {
  const { certification, count, difficulty, domainId, avoid } = req;
  const domain = domainId
    ? certification.domains.find((d) => d.id === domainId)
    : undefined;
  return [
    { role: "system", content: JSON_RULES },
    {
      role: "user",
      content: `${certContext(certification)}

Generate ${count} exam-style practice questions${
        domain ? ` focused on domainId "${domain.id}" (${domain.name})` : ""
      }.
Difficulty: ${difficulty === "mixed" ? "a mix of easy, medium and hard" : difficulty}.
Use realistic exam scenarios. For multi-select, include 2+ correct answers.
${avoid?.length ? `Avoid duplicating these question topics already generated: ${avoid.slice(0, 40).join("; ")}.` : ""}

Return JSON:
{ "questions": [{ "type": "mcq"|"multi-select"|"scenario", "difficulty": "easy"|"medium"|"hard", "domainId": string, "topic": string, "question": string, "options": string[], "correctIndices": number[], "explanation": string }] }`,
    },
  ];
}

export function flashcardsPrompt(req: FlashcardRequest): ChatMessage[] {
  const { certification, count, domainId } = req;
  const domain = domainId
    ? certification.domains.find((d) => d.id === domainId)
    : undefined;
  return [
    { role: "system", content: JSON_RULES },
    {
      role: "user",
      content: `${certContext(certification)}

Generate ${count} concise flashcards${domain ? ` for ${domain.name}` : ""}.
Front = a focused question/term, Back = a tight, exam-accurate answer.
Use the domain/topic as the "category".

Return JSON:
{ "flashcards": [{ "category": string, "difficulty": "easy"|"medium"|"hard", "question": string, "answer": string }] }`,
    },
  ];
}

export function cheatSheetPrompt(req: CheatSheetRequest): ChatMessage[] {
  const { certification, topic } = req;
  return [
    { role: "system", content: JSON_RULES },
    {
      role: "user",
      content: `${certContext(certification)}

Create a comprehensive exam cheat sheet for the topic: "${topic}".
Include comparison tables where natural (e.g. service A vs B vs C).

Return JSON:
{ "topic": string, "definition": string, "architecture": string, "useCases": string[], "bestPractices": string[], "commonMistakes": string[], "comparisonTables": [{ "title": string, "headers": string[], "rows": string[][] }], "examTips": string[], "interviewTips": string[], "sections": [{ "heading": string, "body": string }] }`,
    },
  ];
}

export function interviewPrompt(req: InterviewRequest): ChatMessage[] {
  const { certification, count, level } = req;
  return [
    { role: "system", content: JSON_RULES },
    {
      role: "user",
      content: `${certContext(certification)}

Generate ${count} ${level}-level interview questions for roles requiring this certification.
Mix categories: technical, system-design, behavioral, scenario.
Provide a strong model answer and 1-3 follow-up questions each.

Return JSON:
{ "questions": [{ "level": "beginner"|"intermediate"|"advanced", "category": "technical"|"system-design"|"behavioral"|"scenario", "question": string, "answer": string, "followUps": string[] }] }`,
    },
  ];
}

const WINDOW_LABEL: Record<RevisionRequest["window"], string> = {
  "30-day": "a 30-day final revision plan",
  "15-day": "a 15-day final revision plan",
  "7-day": "a 7-day final revision plan",
  "last-week": "a last-week intensive revision plan",
  "48-hours": "a final 48-hour revision plan",
  "24-hours": "a final 24-hour cram plan",
  "exam-day": "an exam-day checklist and quick refresher",
};

export function revisionPrompt(req: RevisionRequest): ChatMessage[] {
  const { certification, window } = req;
  return [
    { role: "system", content: JSON_RULES },
    {
      role: "user",
      content: `${certContext(certification)}

Create ${WINDOW_LABEL[window]}.
Prioritize high-weightage domains and commonly-tested gotchas.
Include a practical exam-day checklist.

Return JSON:
{ "title": string, "summary": string, "items": [{ "topic": string, "domainId": string, "keyPoints": string[], "estimatedMinutes": number }], "examDayChecklist": string[] }`,
    },
  ];
}
