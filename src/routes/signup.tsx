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

const signupSchema = z.object({
  name: z.string().min(2, "Name is required."),
  studentId: z.string().min(2, "Student ID is required."),
  department: z.string().min(2, "Department is required."),
  year: z.string().min(1, "Year is required."),
  phone: z.string().min(8, "Phone number is required."),
  email: z.string().email("Enter a valid email."),
  password: z
    .string()
    .min(8, "Password should be at least 8 characters.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

type SignupValues = z.infer<typeof signupSchema>;

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign up — CAMPUSLY" },
      { name: "description", content: "Create your CAMPUSLY account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { redirect } = Route.useSearch();
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      studentId: "",
      department: "",
      year: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignupValues) => {
    try {
      await signup(values);
      toast.success("Account created successfully!");
      await navigate({ to: redirect || "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed.");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h1 className="font-display text-3xl font-bold">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign up to register and save events.</p>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <Field
              label="Full Name"
              name="name"
              register={form.register}
              error={form.formState.errors.name?.message}
            />
            <Field
              label="Student ID"
              name="studentId"
              register={form.register}
              error={form.formState.errors.studentId?.message}
            />
            <Field
              label="Department"
              name="department"
              register={form.register}
              error={form.formState.errors.department?.message}
            />
            <Field
              label="Year"
              name="year"
              register={form.register}
              error={form.formState.errors.year?.message}
            />
            <Field
              label="Phone"
              name="phone"
              register={form.register}
              error={form.formState.errors.phone?.message}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              register={form.register}
              error={form.formState.errors.email?.message}
            />
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating account..." : "Sign up"}
              </Button>
            </div>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              search={redirect ? { redirect } : undefined}
              className="font-semibold text-primary"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  register,
  error,
}: {
  label: string;
  name: keyof SignupValues;
  type?: string;
  register: ReturnType<typeof useForm<SignupValues>>["register"];
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} {...register(name)} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
