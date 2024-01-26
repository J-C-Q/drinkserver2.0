import { LoadingDrinkEntry } from "@/components/drinks/loading/loading-drink-entry";
import { LoadingNavigator } from "@/components/drinks/loading/loading-navigation";

const LoadingDrinks = () => {
  return (
    <main className="w-screen">
      <LoadingNavigator />
      <div className="w-full flex flex-col gap-2 p-2 text-6xl text-red-600">
        <LoadingDrinkEntry />
        <LoadingDrinkEntry />
        <LoadingDrinkEntry />
        <LoadingDrinkEntry />
        <LoadingDrinkEntry />
        <LoadingDrinkEntry />
      </div>
    </main>
  );
};

export default LoadingDrinks;
