import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Target } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

describe("StatCard", () => {
  it("renders label, value and hint", () => {
    render(<StatCard icon={Target} label="Readiness" value="82%" hint="Looking good" />);
    expect(screen.getByText("Readiness")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("Looking good")).toBeInTheDocument();
  });
});
