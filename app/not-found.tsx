// app/not-found.tsx
export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="not-found-page flex flex-col items-center justify-center min-h-[90vh] bg-white dark:bg-black text-center px-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
        Oops! The page you're looking for doesn't exist.
      </p>
      <img
        src="/images/404.jpg"
        alt="404 Not Found"
        className="w-64 h-auto mb-6"
      />
      <a href="/" className="text-red-600 hover:underline">
        Go back to Home
      </a>
    </div>
  );
}
