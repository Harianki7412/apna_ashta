"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <div>
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred. Please try again.</p>
            {error.digest && <p>Error ID: {error.digest}</p>}
            <button onClick={reset}>Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
