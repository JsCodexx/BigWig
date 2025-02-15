"use client";
import { UserProvider, useUser } from "@/context/UserContext";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <UserProvider>
          <AppContent>{children}</AppContent>
        </UserProvider>
      </body>
    </html>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { loading, role } = useUser(); // ✅ Fetch user role from context

  if (loading) return <div>bua...</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-40px)] pt-[50px]">{children}</div>{" "}
    </>
  );
}
