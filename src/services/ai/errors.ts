/** Typed AI errors so the UI can present friendly, actionable recovery. */
export type AIErrorCode =
  | "invalid_key"
  | "rate_limit"
  | "network"
  | "malformed_response"
  | "empty_response"
  | "timeout"
  | "unknown";

export class AIError extends Error {
  code: AIErrorCode;
  /** Whether retrying the same request might succeed. */
  retryable: boolean;
  /** Original error/status for debugging. */
  cause?: unknown;

  constructor(code: AIErrorCode, message: string, retryable = false, cause?: unknown) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.retryable = retryable;
    this.cause = cause;
  }
}

export const FRIENDLY_MESSAGES: Record<AIErrorCode, string> = {
  invalid_key:
    "Your API key was rejected. Open Settings and check that the key is correct and active.",
  rate_limit:
    "The provider is rate-limiting requests. Wait a moment and try again.",
  network:
    "Couldn't reach the provider. Check your internet connection and try again.",
  malformed_response:
    "The AI returned a response we couldn't parse. We retried automatically — please try once more.",
  empty_response: "The AI returned an empty response. Please try again.",
  timeout: "The request timed out. Try again, perhaps with a smaller batch.",
  unknown: "Something went wrong while contacting the AI provider.",
};

export function toAIError(err: unknown): AIError {
  if (err instanceof AIError) return err;
  if (err instanceof Error) {
    if (/fetch|network|Failed to fetch/i.test(err.message)) {
      return new AIError("network", err.message, true, err);
    }
    return new AIError("unknown", err.message, false, err);
  }
  return new AIError("unknown", "Unknown error", false, err);
}
