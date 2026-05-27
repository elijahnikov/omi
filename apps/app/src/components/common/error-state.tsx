import { Button } from "@omi/ui/button";
import { RiErrorWarningFill } from "@remixicon/react";
import * as Sentry from "@sentry/tanstackstart-react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { EmptyState } from "./empty-state";

export function ErrorState({
  error,
  reset,
}: {
  error: unknown;
  reset?: () => void;
}) {
  const router = useRouter();
  const message =
    import.meta.env.DEV && error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const handleRetry = () => {
    if (reset) {
      reset();
      return;
    }
    router.invalidate();
  };

  return (
    <EmptyState
      action={
        <Button onClick={handleRetry} variant="omi">
          Try again
        </Button>
      }
      description={message}
      Icon={RiErrorWarningFill}
      title="Something went wrong"
    />
  );
}
