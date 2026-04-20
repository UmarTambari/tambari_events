"use client";

import { useState } from "react";
import { Card, 
  CardContent, 
  CardHeader, 
  CardTitle }     from "@/components/ui/card";
import { Label }  from "@/components/ui/label";
import { Input }  from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast }     from "sonner";

interface ProfileInfoTabProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ProfileInfoTab({ user }: ProfileInfoTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    phoneNumber: user.phoneNumber ?? "",
  });

  const handleSave = async () => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber ?? "",
    });
    setIsEditing(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Profile Form */}
      <Card className="bg-white border-dash-border lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Personal Information
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-dash-accent text-dash-muted hover:bg-dash-highlight"
            >
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-dash-ink">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-accent" />
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                disabled={!isEditing}
                className="pl-10 border-dash-border focus:border-dash-accent-strong disabled:opacity-100 disabled:cursor-default"
              />
            </div>
          </div>

          {/* Email - Read only */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-dash-ink">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-accent" />
              <Input
                id="email"
                value={user.email}
                disabled
                className="pl-10 border-dash-border disabled:opacity-100 disabled:cursor-default"
              />
            </div>
            <p className="text-xs text-dash-accent">
              Email cannot be changed. Contact support if you need assistance.
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-dash-ink">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-accent" />
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                disabled={!isEditing}
                placeholder="+234 800 000 0000"
                className="pl-10 border-dash-border focus:border-dash-accent-strong disabled:opacity-100 disabled:cursor-default"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-dash-accent hover:bg-dash-accent-strong text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="border-dash-accent text-dash-muted hover:bg-dash-highlight"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="bg-white border-dash-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-dash-ink">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-dash-accent mb-1">Account Status</p>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Active
            </Badge>
          </div>

          <div className="h-px bg-dash-accent/20" />

          <div>
            <p className="text-sm text-dash-accent mb-1">Member Since</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-dash-muted" />
              <p className="text-sm font-medium text-dash-ink">
                {user.createdAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-dash-accent mb-1">Last Updated</p>
            <p className="text-sm font-medium text-dash-ink">
              {user.updatedAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="h-px bg-dash-accent/20" />

          <div>
            <p className="text-sm text-dash-accent mb-2">Account ID</p>
            <p className="text-xs font-mono text-dash-ink bg-dash-highlight p-2 rounded break-all">
              {user.id}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-white border-red-200 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-red-600">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium text-dash-ink">Delete Account</p>
              <p className="text-sm text-dash-muted mt-1">
                Once you delete your account, there is no going back. All your
                events, orders, and data will be permanently deleted.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 whitespace-nowrap"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
