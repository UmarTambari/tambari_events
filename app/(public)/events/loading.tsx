export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-96 animate-pulse" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-24 h-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Events Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="pt-4 border-t border-gray-100">
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}