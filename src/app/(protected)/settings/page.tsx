import { auth, signOut } from "@/auth";
import { redirect } from "next/dist/server/api-utils";

const SettingsPage = async () => {
  const session = await auth();
  return (
    <div>
      {JSON.stringify(session)}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit">Logout</button>
      </form>
    </div>
  );
};

export default SettingsPage;
