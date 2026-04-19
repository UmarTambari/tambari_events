import Link           from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUP() {
  return (
    <div className="min-h-screen bg-[#EFE3C2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-[#85A947]/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#123524]">Tambari EventHub</h1>
            <p className="text-[#3E7B27] mt-2">Create your account</p>
          </div>

          <SignUpForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-[#3E7B27]">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-[#123524] hover:text-[#3E7B27] underline"
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
