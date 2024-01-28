import { LoadingGithubLike } from "@/components/drinks/loading/loading-github-like-grid";
import { LoadingNavigator } from "@/components/drinks/loading/loading-navigation";

const LoadingDrinks = () => {
  return (
    <main className="min-h-screen">
      <LoadingNavigator />
      <LoadingGithubLike />
    </main>
  );
};

export default LoadingDrinks;
