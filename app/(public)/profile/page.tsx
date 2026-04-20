import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { User, Mail, Phone, Calendar } from "lucide-react";
import { getUserByAuthId } from "@/lib/queries/users.queries";
import { format } from "date-fns";
import { UpdateProfileForm } from "@/components/public/update-profile-form";

export default async function ProfilePage() {
  // Create Supabase server client (with cookies)
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !supabaseUser) {
    redirect("/sign-in?redirect=/profile");
  }

  const user = await getUserByAuthId(supabaseUser.id);
  if (!user) {
    redirect("/sign-in?redirect=/profile");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="space-y-6">
          {/* Profile Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.fullName}
                </h2>
                <p className="text-gray-600">
                  Member since {format(new Date(user.createdAt), "MMMM yyyy")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>

              {user.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-semibold text-gray-900">
                      {user.phoneNumber}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(user.createdAt), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Update Profile Form */}
          <UpdateProfileForm user={user} />

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <a
                href="/my-tickets"
                className="block px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">My Tickets</span>
                  <span className="text-gray-400">→</span>
                </div>
              </a>

              <a
                href="/dashboard"
                className="block px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Organizer Dashboard
                  </span>
                  <span className="text-gray-400">→</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}