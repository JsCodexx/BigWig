"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext"; // Assuming you're using a UserContext
import Landing from "@/components/landing/landing";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser(); // Fetch user data from context

  useEffect(() => {
    const checkUserSession = async () => {
      if (user) {
        // User is already authenticated, redirect based on the role
        switch (user.role) {
          case "admin":
            router.push("/admin");
            break;
          case "surveyor":
            router.push("/surveyor");
            break;
          case "client":
            router.push("/client");
            break;
          default:
            router.push("/");
            break;
        }
      } else {
        // No user in context, redirect to login
        router.push("/auth");
      }
    };

    checkUserSession();
  }, [user, router]); // Listen for changes in user context

  return (
    <div>
      <Landing />
    </div>
  );
};

export default Home;
