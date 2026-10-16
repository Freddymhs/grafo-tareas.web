"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
      <p className="text-gray-500 text-sm">{error.message}</p>
      <button onClick={reset} className="text-blue-500 hover:underline text-sm">
        Try again
      </button>
    </div>
  );
}
