import Link           from "next/link";
import { Suspense }   from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

interface SignInPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function SignIn({ searchParams }: SignInPageProps) {
  const { redirect: redirectParam } = await searchParams;
  const signUpHref =
    redirectParam != null && redirectParam !== ""
      ? `/sign-up?redirect=${encodeURIComponent(redirectParam)}`
      : "/sign-up";

  return (
    <div className="min-h-screen bg-dash-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-dash-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dash-ink">Tambari EventHub</h1>
            <p className="text-dash-muted mt-2">Sign in to your account</p>
          </div>

          <Suspense fallback={<div className="text-center text-sm text-dash-muted">Loading…</div>}>
            <SignInForm />
          </Suspense>

          <div className="mt-6 text-center">
            <p className="text-sm text-dash-muted">
              Don&apos;t have an account?{" "}
              <Link
                href={signUpHref}
                className="font-medium text-dash-ink hover:text-dash-muted underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
