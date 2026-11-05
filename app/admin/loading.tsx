export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-label="Loading admin panel">
      <div className="skeleton h-16 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
      <div className="skeleton h-80 rounded-2xl" />
    </div>
  );
}
