import { auth, signOut } from "@/auth";
import { getItems } from "@/data/item";
import { DrinkEntry } from "@/components/drinks/drink-entry";
import { SessionProvider } from "next-auth/react";

const DrinksPage = async () => {
  const session = await auth();
  const drinks = await getItems();
  return (
    <div className="w-screen">
      {drinks &&
        drinks.map((drink) => {
          return (
            <SessionProvider key={drink.itemid}>
              <DrinkEntry
                drinkname={drink.itemname}
                drinkid={drink.itemid}
                drinkprice={drink.itemprice}
                drinkquantity={drink.quantity}
                key={drink.itemid}
              />
            </SessionProvider>
          );
        })}
    </div>
  );
};

export default DrinksPage;
