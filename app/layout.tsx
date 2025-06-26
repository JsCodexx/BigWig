// app/layout.tsx

import "./globals.css";
import { UiProvider } from "@/context/UiContext";
import { UserProvider } from "@/context/UserContext";
import AppContent from "./app-content"; // your client layout
import ErrorBoundary from "./ErrorBoundary";

export const metadata = {
  title: "BigWig",
  description: "Billboard management app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen w-full">
        <UiProvider>
          <UserProvider>
            <ErrorBoundary>
              <AppContent>{children}</AppContent>
            </ErrorBoundary>
          </UserProvider>
        </UiProvider>
      </body>
    </html>
  );
}
