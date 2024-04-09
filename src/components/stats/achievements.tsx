"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Achievement } from "@prisma/client";
import { Badge } from "../ui/badge";

interface AchievementProps {
  achievements: Achievement[];
  openAchievements: Achievement[];
}
export const Achievements = ({
  achievements,
  openAchievements,
}: AchievementProps) => {
  const fillArray = new Array(10).fill(10);
  return (
    <div className="p-5 flex flex-wrap gap-2 justify-left pt-10 w-[85%] m-auto">
      {achievements.map((achievement) => (
        <Badge
          key={achievement.id}
          className={rarityToStyle(achievement.rarity)}
        >
          {achievement.name}
        </Badge>
        // <Popover key={achievement.id}>
        //   <PopoverTrigger asChild>
        //     <div
        //       className={
        //         "text-lg font-semibold px-1 rounded-md " +
        //         rarityToColor(achievement.rarity)
        //       }
        //       key={achievement.id}
        //     >
        //       {achievement.name}
        //     </div>
        //   </PopoverTrigger>
        //   <PopoverContent
        //     className={
        //       "h-fit w-40 m-0 text-black py-0 px-1 border-none " +
        //       rarityToColor(achievement.rarity)
        //     }
        //   >
        //     <div className="font-semibold text-lg">{achievement.name}</div>
        //     <span>{achievement.description}</span>
        //   </PopoverContent>
        // </Popover>
      ))}
      {openAchievements.map((achievement) => (
        <Badge
          key={achievement.id}
          className={rarityToStyle(achievement.rarity) + " blur-sm"}
        >
          {achievement.name}
        </Badge>
      ))}
    </div>
  );
};

function rarityToStyle(rarity: string) {
  switch (rarity) {
    case "COMMON":
      return "text-gray-400 bg-gray-900";
    case "RARE":
      return "text-gray-700 bg-slate-300";
    case "LEGENDARY":
      return "text-amber-700 bg-[linear-gradient(110deg,#fbbf24,45%,#fde68a,55%,#fbbf24)] bg-[length:200%_100%] animate-shimmer delay-1000 transition-colors";
  }
}
