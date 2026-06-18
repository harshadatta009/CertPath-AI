import { describe, it, expect } from "vitest";
import { extractJson } from "@/services/ai/base-provider";
import { AIError } from "@/services/ai/errors";

describe("extractJson", () => {
  it("parses a clean JSON object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips markdown code fences", () => {
    const text = '```json\n{"hello":"world"}\n```';
    expect(extractJson(text)).toEqual({ hello: "world" });
  });

  it("extracts JSON embedded in prose", () => {
    const text = 'Sure! Here you go: {"x":[1,2,3]} Hope that helps.';
    expect(extractJson(text)).toEqual({ x: [1, 2, 3] });
  });

  it("throws empty_response on blank input", () => {
    expect(() => extractJson("   ")).toThrowError(AIError);
    try {
      extractJson("");
    } catch (e) {
      expect((e as AIError).code).toBe("empty_response");
    }
  });

  it("throws malformed_response when no JSON present", () => {
    try {
      extractJson("no json here");
    } catch (e) {
      expect((e as AIError).code).toBe("malformed_response");
    }
  });
});
