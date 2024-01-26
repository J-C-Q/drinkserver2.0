import { Suspense } from "react";
import LoadingDrinks from "./loading";

const DrinksLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingDrinks />}>{children}</Suspense>;
};

export default DrinksLayout;
