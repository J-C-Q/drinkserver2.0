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
    <div className="flex flex-wrap gap-2 justify-start pt-10 w-[75%] m-auto relative">
      {achievements.map((achievement) => (
        <Badge
          key={achievement.id}
          className={
            rarityToStyle(achievement.rarity) +
            " text-sm font-semibold grow justify-center group border-4"
          }
        >
          <span className="group-active:hidden group-hover:hidden">
            {achievement.name}
          </span>
          <span className="hidden group-active:block group-hover:block">
            {achievement.description}
          </span>
        </Badge>
      ))}
      {openAchievements.map((achievement) => (
        <Badge
          key={achievement.id}
          className={
            // rarityToStyle(achievement.rarity) +
            " bg-gray-800  border-gray-100 border-4 blur-sm opacity-20 brightness-50 text-sm font-semibold grow justify-center"
          }
        >
          {achievement.name}
        </Badge>
      ))}
      <span className="w-full text-sm text-center absolute bottom-[-20px] translate-y-[100%] text-gray-600">
        Your achievements
      </span>
    </div>
  );
};

function rarityToStyle(rarity: string) {
  switch (rarity) {
    case "COMMON":
      return "text-[#462700] bg-gradient-to-tr from-[#CD7F32] to-[#ad6415]";
    case "RARE":
      return "text-[#333333] bg-gradient-to-tr from-[#C0C0C0] to-[#a3a3a3] ";
    case "LEGENDARY":
      return "text-[#333333] bg-[linear-gradient(110deg,#ddb900,45%,#FFD700,55%,#ddb900)] bg-[length:200%_100%] animate-shimmer delay-1000 transition-colors";
  }
}
