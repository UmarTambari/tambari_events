import Link           from "next/link";
import { Suspense }   from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";

interface SignUpPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function SignUP({ searchParams }: SignUpPageProps) {
  const { redirect: redirectParam } = await searchParams;
  const signInHref =
    redirectParam != null && redirectParam !== ""
      ? `/sign-in?redirect=${encodeURIComponent(redirectParam)}`
      : "/sign-in";

  return (
    <div className="min-h-screen bg-dash-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-dash-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dash-ink">Tambari EventHub</h1>
            <p className="text-dash-muted mt-2">Create your account</p>
          </div>

          <Suspense fallback={<div className="text-center text-sm text-dash-muted">Loading…</div>}>
            <SignUpForm />
          </Suspense>

          <div className="mt-6 text-center">
            <p className="text-sm text-dash-muted">
              Already have an account?{" "}
              <Link
                href={signInHref}
                className="font-medium text-dash-ink hover:text-dash-muted underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
