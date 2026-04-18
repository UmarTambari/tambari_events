export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Skeleton */}
      <div className="h-64 md:h-96 w-full bg-gray-200 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="space-y-2 mb-6">
                <div className="h-5 bg-gray-200 rounded w-48" />
                <div className="h-5 bg-gray-200 rounded w-40" />
                <div className="h-5 bg-gray-200 rounded w-56" />
              </div>
              <div className="flex items-center space-x-3 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="p-6 border-b border-gray-200">
                <div className="h-8 bg-gray-200 rounded w-40" />
              </div>
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-3" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}