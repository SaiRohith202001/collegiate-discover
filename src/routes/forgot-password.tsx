import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/campusly/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — CAMPUSLY" },
      { name: "description", content: "Request a password reset link for your CAMPUSLY account." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      const result = await authService.forgotPassword({ email: values.email.trim() });
      toast.success(result.message);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reset link.");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="font-display text-3xl font-bold">Forgot password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we'll send you a secure reset link.
          </p>

          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            Back to{" "}
            <Link to="/login" className="font-semibold text-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
