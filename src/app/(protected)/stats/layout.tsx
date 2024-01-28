import { Suspense } from "react";
import LoadingStats from "./loading";

const StatsLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingStats />}>{children}</Suspense>;
};

export default StatsLayout;
