import { ProfileClient } from "@/components/profile/profile-client";

// Mock data - replace with actual API call to get user data
async function getUserProfile() {
  return {
    id: "user-123",
    authId: "auth-456",
    email: "john.doe@example.com",
    fullName: "John Doe",
    phoneNumber: "+234 801 234 5678",
    createdAt: new Date("2024-01-15T10:00:00"),
    updatedAt: new Date("2024-11-20T14:30:00"),
    // Stats
    totalEvents: 12,
    totalOrders: 248,
    totalRevenue: 2450000,
  };
}

export default async function ProfilePage() {
  const user = await getUserProfile();

  return <ProfileClient user={user} />;
}
