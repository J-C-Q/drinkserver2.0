"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Rarity } from "@prisma/client";

// type for achievements
type Achievement = {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  image: string | null;
};

type Achievements = {
  achievements: Achievement[];
};

export const Achievements = ({ achievements }: Achievements) => {
  //   const achievements = [
  //     {
  //       id: 1,
  //       name: "Night Owl",
  //       description: "Consume a drink between 11pm and 4am",
  //       color: "bg-amber-300",
  //     },
  //     {
  //       id: 2,
  //       name: "Early Bird",
  //       description: "Consume a drink between 6am and 8am",
  //       color: "bg-amber-300",
  //     },
  //     {
  //       id: 3,
  //       name: "Weekend Warrior",
  //       description: "Consume a drink on a weekend",
  //       color: "bg-amber-300",
  //     },
  //     {
  //       id: 4,
  //       name: "Explorer",
  //       description: "Consume every available drink",
  //       color: "bg-amber-300",
  //     },
  //     {
  //       id: 5,
  //       name: "Sunday Drinker",
  //       description: "Consume a drink on a Sunday",
  //       color: "bg-amber-300",
  //     },
  //     {
  //       id: 6,
  //       name: "Thirsty",
  //       description: "Consume 3 drinks in a day",
  //       color: "bg-amber-300",
  //     },
  //     {
  //       id: 7,
  //       name: "Junkie",
  //       description: "Consume 5 drinks in a day",
  //       color: "bg-amber-300",
  //     },
  //     {
  //       id: 8,
  //       name: "Long Week",
  //       description: "Consume a drink every day of the week",
  //       color: "bg-amber-300",
  //     },
  //     {
  //       id: 9,
  //       name: "Mate Mate enjoyer",
  //       description: "Drink at least 5 Mate Mate",
  //     },
  //   ];

  return (
    <div className="p-5 flex flex-wrap gap-2 justify-center pt-10">
      {achievements.map((achievement) => (
        <Popover key={achievement.id}>
          <PopoverTrigger asChild>
            <div
              className={
                "text-lg font-semibold px-1 rounded-md " +
                rarityToColor(achievement.rarity)
              }
              key={achievement.id}
            >
              {achievement.name}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className={
              "h-fit w-40 m-0 text-black py-0 px-1 border-none " +
              rarityToColor(achievement.rarity)
            }
          >
            <div className="font-semibold text-lg">{achievement.name}</div>
            <span>{achievement.description}</span>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
};

function rarityToColor(rarity: string) {
  switch (rarity) {
    case "COMMON":
      return "bg-gray-400";
    case "RARE":
      return "bg-amber-400";
    case "LEGENDARY":
      return "bg-amber-600";
  }
}
