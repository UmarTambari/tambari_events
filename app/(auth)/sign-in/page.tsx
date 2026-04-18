import { SignInForm } from "@/components/auth/sign-in-form";
import Link from "next/link";


export default function SignIn() {
  return (
    <div className="min-h-screen bg-[#EFE3C2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-[#85A947]/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#123524]">EventHub</h1>
            <p className="text-[#3E7B27] mt-2">Sign in to your account</p>
          </div>

          <SignInForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-[#3E7B27]">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
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
