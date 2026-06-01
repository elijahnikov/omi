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
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

interface ResetPasswordValues {
  confirmPassword: string;
  password: string;
}

export default function ResetPasswordPageComponent() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/_auth/reset-password" });
  const form = useForm<ResetPasswordValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      return;
    }
    const res = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (res.error) {
      toastManager.add({
        type: "error",
        title: res.error.message ?? "Could not reset password",
      });
      return;
    }

    toastManager.add({
      type: "success",
      title: "Password updated — you can now sign in",
    });
    navigate({ to: "/login" });
  };

  if (!token) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="mx-auto flex flex-col justify-center text-center">
          <h1 className="font-semibold text-xl">Invalid reset link</h1>
          <Text className="font-medium text-ui-fg-muted" size="small">
            This password reset link is missing or invalid. Request a new one to
            continue.
          </Text>
        </div>
        <Text
          className="text-center font-medium text-ui-fg-muted"
          size="xsmall"
        >
          <Link
            className="text-ui-fg-base underline"
            preload="viewport"
            to="/forgot-password"
          >
            Request a new link
          </Link>
        </Text>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="mx-auto flex flex-col justify-center text-center">
        <h1 className="font-semibold text-xl">Choose a new password</h1>
        <Text className="font-medium text-ui-fg-muted" size="small">
          Enter a new password for your account.
        </Text>
      </div>
      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="New password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            }}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Confirm new password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{
              required: "Please confirm your password",
              validate: (value) =>
                value === form.getValues("password") || "Passwords don't match",
            }}
          />
          <LoadingButton
            className="w-full"
            loading={form.formState.isSubmitting}
            type="submit"
            variant="omi"
          >
            Update password
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
}
