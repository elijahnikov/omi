import { authClient } from "@omi/auth/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@omi/ui/form";
import { Input } from "@omi/ui/input";
import { LoadingButton } from "@omi/ui/loading-button";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ForgotPasswordValues {
  email: string;
}

export default function ForgotPasswordPageComponent() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    const res = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (res.error) {
      toastManager.add({
        type: "error",
        title: res.error.message ?? "Could not send reset email",
      });
      return;
    }

    setSentTo(values.email);
  };

  if (sentTo) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="mx-auto flex flex-col justify-center text-center">
          <h1 className="font-semibold text-xl">Check your email</h1>
          <Text className="font-medium text-ui-fg-muted" size="small">
            If an account exists for {sentTo}, we sent a link to reset your
            password.
          </Text>
        </div>
        <Text
          className="text-center font-medium text-ui-fg-muted"
          size="xsmall"
        >
          Back to{" "}
          <Link
            className="text-ui-fg-base underline"
            preload="viewport"
            to="/login"
          >
            sign in
          </Link>
        </Text>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="mx-auto flex flex-col justify-center text-center">
        <h1 className="font-semibold text-xl">Reset your password</h1>
        <Text className="font-medium text-ui-fg-muted" size="small">
          Enter your email and we'll send you a link to reset it.
        </Text>
      </div>
      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{ required: "Email is required" }}
          />
          <LoadingButton
            className="w-full"
            loading={form.formState.isSubmitting}
            type="submit"
            variant="omi"
          >
            Send reset link
          </LoadingButton>
        </form>
      </Form>
      <Text className="text-center font-medium text-ui-fg-muted" size="xsmall">
        Back to{" "}
        <Link
          className="text-ui-fg-base underline"
          preload="viewport"
          to="/login"
        >
          sign in
        </Link>
      </Text>
    </div>
  );
}
