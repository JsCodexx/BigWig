"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Cookies from "js-cookie";
import { User } from "@/types/user";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "./SidebarContext";

// Define UserContext type
interface UserContextType {
  user: User;
  role: any;
  loading: boolean;
  setUser: (user: any) => void;
}

// ✅ Create UserContext
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const pathname = usePathname(); // ✅ Works in App Router

  const checkUserSession = useCallback(async () => {
    console.log("Checking user session...");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (profileError || !profile) {
          console.error("Error fetching profile:", profileError);
          return; // ⛔ Avoid calling `setState()` if there's an error
        }
        setUser(profile);
        setRole(profile.user_role);
        return;
      }

      // 2️⃣ If no Supabase session, check custom JWT token
      const token = Cookies.get("token");
      if (token) {
        console.log("Using custom JWT authentication...");
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log(userData.user_role);
          setRole(userData.user_role);
        } else {
          console.log("Invalid token, logging out...");
          Cookies.remove("token");
        }
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setLoading(false); // ✅ Always set loading to false at the end
    }
  }, []);

  useEffect(() => {
    // ✅ Prevent redirect loop when user is on login page
    if (pathname !== "/auth/login") {
      checkUserSession();
    }
  }, [pathname]);

  return (
    <SidebarProvider>
      <UserContext.Provider value={{ user, role, loading, setUser }}>
        {children}
      </UserContext.Provider>
    </SidebarProvider>
  );
};

// ✅ Custom Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
