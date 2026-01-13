"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Zone detail error:", error);
  }, [error]);

  const isDemoError = error.message?.includes("Simulated API error");

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          Back to Zones
        </Button>
      </div>
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            {isDemoError
              ? "This is a simulated error for demo purposes. Remove ?error=true from the URL to see normal behavior."
              : error.message || "Failed to load zone details"}
          </p>
          <Button onClick={reset} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
