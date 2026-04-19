"use client";

import { Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger }             from "@/components/ui/tabs";
import { ProfileInfoTab }   from "./profile-info-tab";
import { SecurityTab }      from "./security-tab";
import { ProfileStatsCard } from "./profile-stats-card";

interface ProfileClientProps {
  user: {
    id: string;
    authId: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
    totalEvents: number;
    totalOrders: number;
    totalRevenue: number;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#123524]">Profile Settings</h1>
        <p className="text-[#3E7B27] mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Stats Cards */}
      <ProfileStatsCard
        totalEvents={user.totalEvents}
        totalOrders={user.totalOrders}
        totalRevenue={user.totalRevenue}
      />

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border border-[#85A947]/20">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-[#85A947] data-[state=active]:text-white"
          >
            Profile Information
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-[#85A947] data-[state=active]:text-white"
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileInfoTab user={user} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
