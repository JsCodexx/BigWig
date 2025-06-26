"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-page flex flex-col items-center justify-center min-h-[90vh] bg-red-200 dark:bg-black text-center px-4">
      <img
        src="/images/404.png"
        alt="404 Not Found"
        className="w-[50%] h-[400px] mb-6"
      />

      <Link href="/" className="text-red-600 hover:underline">
        Go back to Home
      </Link>
    </div>
  );
}
