import { auth, signOut } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { Navigator } from "@/components/drinks/navigation";

const AdminPage = async () => {
  const session = await auth();
  return (
    <main className="min-h-screen w-full">
      <SessionProvider>
        <Navigator
          username={session?.user.name}
          greeting={"Admin "}
          subtitle={"Manage the service"}
        ></Navigator>
      </SessionProvider>
    </main>
  );
};

export default AdminPage;

// froce dynamic
export const dynamic = "force-dynamic";
