import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/campusly/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password should be at least 8 characters.")
      .regex(/[A-Z]/, "Password must include an uppercase letter.")
      .regex(/[a-z]/, "Password must include a lowercase letter.")
      .regex(/[0-9]/, "Password must include a number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reset password — CAMPUSLY" },
      { name: "description", content: "Create a new password for your CAMPUSLY account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      toast.error("The reset link is invalid or expired.");
      return;
    }

    try {
      const result = await authService.resetPassword({
        token,
        password: values.password,
      });
      toast.success(result.message);
      await navigate({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    }
  };

  if (!token) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
          <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h1 className="font-display text-3xl font-bold">Reset link missing</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This password reset link is invalid or expired. Please request a new reset link.
            </p>
            <div className="mt-6">
              <Link to="/forgot-password" className="font-semibold text-primary">
                Request a new link
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="font-display text-3xl font-bold">Set new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create a new secure password for your account.</p>

          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            Remembered it? <Link to="/login" className="font-semibold text-primary">Login</Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
