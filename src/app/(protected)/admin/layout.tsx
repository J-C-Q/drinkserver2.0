import { Suspense } from "react";
import LoadingAdmin from "./loading";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingAdmin />}>{children}</Suspense>;
};

export default AdminLayout;
