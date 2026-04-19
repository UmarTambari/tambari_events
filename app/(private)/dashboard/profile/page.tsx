import { redirect }          from "next/navigation";
import { ProfileClient }     from "@/components/profile/profile-client";
import { getCurrentUserId }  from "@/lib/auth";
import { getUserById }       from "@/lib/queries/users.queries";
import { getDashboardStats } from "@/lib/queries/dashboard.queries";

export default async function ProfilePage() {
  const userId = await getCurrentUserId();

  const [user, stats] = await Promise.all([
    getUserById(userId),
    getDashboardStats(userId),
  ]);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <ProfileClient
      user={{
        id: user.id,
        authId: user.authId,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber ?? "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        totalEvents: stats.totalEvents,
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
      }}
    />
  );
}
