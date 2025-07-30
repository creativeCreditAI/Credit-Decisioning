import { UserDashboard } from "@/components/UserDashboard";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  if (user?.role === "admin") {
    return <AdminDashboardLayout />;
  }

  return <UserDashboard />;
};

export default Index;
