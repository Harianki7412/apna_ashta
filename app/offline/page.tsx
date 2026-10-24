export default function Offline() {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold">You're offline</h1>
      <p className="text-gray-600 mt-2">Check your internet connection.</p>
      <a
        href="/"
        className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded"
      >
        Retry
      </a>
    </div>
  );
}
