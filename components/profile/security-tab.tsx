// components/profile/security-tab.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, Shield, Loader2, CheckCircle2 } from "lucide-react";

export function SecurityTab() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    try {
      // TODO: Implement API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Changing password");
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isPasswordValid = () => {
    return (
      passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      passwordData.newPassword === passwordData.confirmPassword &&
      passwordData.newPassword.length >= 8
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Change Password */}
      <Card className="bg-white border-dash-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink flex items-center gap-2">
            <Lock className="h-5 w-5 text-dash-accent" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-dash-ink">
              Current Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-accent" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
                className="pl-10 pr-10 border-dash-border focus:border-dash-accent-strong"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dash-accent hover:text-dash-muted"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-dash-ink">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-accent" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password"
                className="pl-10 pr-10 border-dash-border focus:border-dash-accent-strong"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dash-accent hover:text-dash-muted"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordData.newPassword && passwordData.newPassword.length < 8 && (
              <p className="text-xs text-red-600">
                Password must be at least 8 characters
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-dash-ink">
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-accent" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
                className="pl-10 pr-10 border-dash-border focus:border-dash-accent-strong"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dash-accent hover:text-dash-muted"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordData.confirmPassword &&
              passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button
              onClick={handleChangePassword}
              disabled={!isPasswordValid() || isChangingPassword}
              className="bg-dash-accent hover:bg-dash-accent-strong text-white"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink flex items-center gap-2">
            <Shield className="h-5 w-5 text-dash-accent" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-dash-muted">
                Use at least 8 characters with a mix of letters, numbers, and
                symbols
              </p>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-dash-muted">
                Don&apos;t use common words or personal information
              </p>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-dash-muted">
                Change your password regularly
              </p>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-dash-muted">
                Never share your password with anyone
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="bg-white border-dash-border lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium text-dash-ink">
                Enable Two-Factor Authentication
              </p>
              <p className="text-sm text-dash-muted mt-1">
                Add an extra layer of security to your account by requiring a
                verification code in addition to your password.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-dash-accent text-dash-muted hover:bg-dash-highlight whitespace-nowrap"
            >
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-white border-dash-border lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Session */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-dash-border bg-dash-highlight/20">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-dash-ink">Current Session</p>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-sm text-dash-muted">
                  Chrome on Windows • Lagos, Nigeria
                </p>
                <p className="text-xs text-dash-accent mt-1">
                  Last active: Just now
                </p>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-dash-accent">
                No other active sessions found
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}