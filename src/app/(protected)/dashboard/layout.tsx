import { Suspense } from "react";
import LoadingDashboard from "./loading";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingDashboard />}>{children}</Suspense>;
};

export default DashboardLayout;
