"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Cookies from "js-cookie";
import { User, UserRole } from "@/types/user";

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUserSession = async () => {
      console.log("Checking user session...");

      // 1️⃣ First, check Supabase session (for email users)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        if (session.user.role) {
          setRole(session.user.role); // Set role here if available
        }
        setLoading(false);
        return;
      }

      // 2️⃣ If no Supabase session, check custom JWT token
      const token = Cookies.get("token");
      console.log(token, "token");
      if (token) {
        console.log("Using custom JWT authentication...");
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setRole(userData.role); // Set role from the response
          setLoading(false);
        } else {
          setLoading(false);
          Cookies.remove("token"); // Remove invalid token
          router.push("/auth/login"); // Redirect to login if token is invalid
        }
      } else {
        setLoading(false);
        router.push("/auth/login"); // Redirect to login if no token
      }
    };

    checkUserSession();
  }, [router, supabase.auth]);

  return (
    <UserContext.Provider value={{ user, role, loading, setUser }}>
      {children}
    </UserContext.Provider>
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
