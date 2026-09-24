const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex min-h-screen flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 to-black"
      vaul-drawer-wrapper=""
    >
      {children}
    </div>
  );
};

export default AuthLayout;
