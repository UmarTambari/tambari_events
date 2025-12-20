import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

console.log(await db.execute(sql`SELECT NOW()`));


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#EFE3C2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-[#85A947]/20">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#123524]">EventHub</h1>
            <p className="text-[#3E7B27] mt-2">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#3E7B27]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-[#123524] hover:text-[#3E7B27] underline"
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
