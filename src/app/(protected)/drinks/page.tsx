import { auth, signOut } from "@/auth";
import { getItems } from "@/data/item";
import { DrinkEntry } from "@/components/drinks/drink-entry";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Navigator } from "@/components/drinks/navigation";

const DrinksPage = async () => {
  const session = await auth();
  // revalidate every 30 seconds

  const drinks = await getItems();
  if (drinks) {
    drinks.sort((a, b) => {
      return a.itemname.localeCompare(b.itemname);
    });
  }

  const getRandomElement = (array: string[]) => {
    return array[Math.floor(Math.random() * array.length)];
  };
  const possibleGreetings = [
    "Hello",
    "Hi",
    "Hey",
    "Welcome",
    "Greetings",
    "Yo",
    "Hiya",
    "Howdy",
    "Sup",
    "Ahoy",
  ];
  const greeting = getRandomElement(possibleGreetings);

  const possibleSubtitles = [
    "What's your drink?",
    "Any drink preference?",
    "Like anything specific?",
    "What will you have?",
    "Choose your beverage?",
    "What do you fancy?",
    "Craving a drink?",
    "Need a refreshment?",
    "What would you like?",
    "Desire a particular drink?",
    "What's your beverage?",
    "What's your favorite drink?",
    "What's your favorite beverage?",
    "Take your pick!",
    "Select your drink!",
  ];
  const subtitle = getRandomElement(possibleSubtitles);

  const possibleQuotes = [
    "Good choice!",
    "Great choice!",
    "Nice choice!",
    "Awesome choice!",
    "Perfect choice!",
    "Amazing choice!",
    "Superb choice!",
    "Brilliant choice!",
    "Fantastic choice!",
    "Excellent choice!",
    "Splendid choice!",
    "Incredible choice!",
    "Unbelievable choice!",
    "Unreal choice!",
    "Unimaginable choice!",
    "Quite the choice!",
    "What a choice!",
    "Are you sure?",
    "Are you certain?",
    "If you say so!",
    "Be sure!",
    "Questionable choice!",
    "Really?",
    "Seriously?",
    "You sure?",
    "You certain?",
    "You sure about that?",
  ];

  // do async stuff for 30 seconds
  //   await new Promise((resolve) => setTimeout(resolve, 10000));
  return (
    <main className="min-h-screen">
      <Navigator
        username={session?.user.name}
        greeting={greeting}
        subtitle={subtitle}
      ></Navigator>
      <div className="w-full flex flex-col gap-2 p-2">
        {drinks &&
          drinks.map((drink) => {
            return (
              <SessionProvider key={drink.itemid}>
                <DrinkEntry
                  drinkname={drink.itemname}
                  drinkid={drink.itemid}
                  drinkprice={drink.itemprice}
                  drinkquantity={drink.quantity}
                  selectedQuote={getRandomElement(possibleQuotes)}
                  bgimage={drink.image ? drink.image : undefined}
                  bgcolor={drink.bgcolor ? drink.bgcolor : undefined}
                  color={drink.color ? drink.color : undefined}
                  key={drink.itemid}
                />
              </SessionProvider>
            );
          })}
        <Toaster richColors />
      </div>
    </main>
  );
};

export default DrinksPage;
