"use client";

import { useState }     from "react";
import { useRouter }    from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button }       from "@/components/ui/button";
import { Input }        from "@/components/ui/input";
import { Label }        from "@/components/ui/label";
import { User, Mail, Lock, Loader2 } from "lucide-react";

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Sign Up error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-[#123524]">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#85A947]" />
          <Input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="John Doe"
            required
            className="pl-10 border-[#85A947]/20 focus:border-[#3E7B27]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#123524]">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#85A947]" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="you@example.com"
            required
            className="pl-10 border-[#85A947]/20 focus:border-[#3E7B27]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#123524]">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#85A947]" />
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="••••••••"
            required
            minLength={8}
            className="pl-10 border-[#85A947]/20 focus:border-[#3E7B27]"
          />
        </div>
        <p className="text-xs text-[#85A947]">Must be at least 8 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[#123524]">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#85A947]" />
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="••••••••"
            required
            className="pl-10 border-[#85A947]/20 focus:border-[#3E7B27]"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#85A947] hover:bg-[#3E7B27] text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
