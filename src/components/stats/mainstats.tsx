"use client";
interface MainStatsProps {
  totalSugar?: number;
  totalCaffein?: number;
}

export const MainStats = (
  { totalSugar, totalCaffein }: MainStatsProps = {
    totalSugar: 0,
    totalCaffein: 0,
  }
) => {
  return (
    <div className="grid grid-rows-1 grid-cols-2 gap-5 pt-0 w-[100%] m-auto relative ">
      <div className="bg-gradient-to-tr from-[#FF6B6B] to-[#dd4d51] grow text-center aspect-square text-5xl flex justify-center items-center relative bg-clip-text text-transparent translate-y-[-10%]  m-auto">
        {totalSugar ? (totalSugar / 1000).toFixed(2) : 0}
        <div className="absolute text-sm left-[50%] translate-x-[-150%] top-[50%] translate-y-[-200%] text-gray-600 not-italic">
          sugar
        </div>
        <div className="absolute text-sm  text-gray-600 not-italic left-[50%] translate-x-[350%] top-[50%] translate-y-[10%]">
          kg
        </div>
      </div>
      <div className="bg-gradient-to-tr from-[#FFD700] to-[#ddb900] grow text-center aspect-square text-5xl flex justify-center items-center relative bg-clip-text text-transparent translate-y-[10%]   m-auto">
        {totalCaffein ? (totalCaffein / 1000).toFixed(2) : 0}
        <div className="absolute text-sm left-[50%] translate-x-[-150%] top-[50%] translate-y-[-200%] text-gray-600 not-italic">
          caffein
        </div>
        <div className="absolute text-sm  text-gray-600 not-italic left-[50%] translate-x-[600%] top-[50%] translate-y-[10%]">
          g
        </div>
      </div>
      <span className="w-full text-sm text-center absolute bottom-[30px] translate-y-[100%] text-gray-600">
        Your stats
      </span>
    </div>
  );
};
