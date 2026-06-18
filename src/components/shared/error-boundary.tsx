"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface State {
  hasError: boolean;
  message?: string;
}

/** Generic client error boundary with a friendly recovery UI. */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackTitle?: string },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
          <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold">
            {this.props.fallbackTitle ?? "Something went wrong"}
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {this.state.message ?? "An unexpected error occurred."}
          </p>
          <Button className="mt-6" variant="outline" onClick={this.reset}>
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
