import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/campusly/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Login — CAMPUSLY" },
      { name: "description", content: "Login to manage your campus events." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { redirect } = Route.useSearch();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
      toast.success("Welcome back!");
      await navigate({ to: redirect || "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="font-display text-3xl font-bold">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">Continue discovering campus events.</p>

          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            New here?{" "}
            <Link
              to="/signup"
              search={redirect ? { redirect } : undefined}
              className="font-semibold text-primary"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
