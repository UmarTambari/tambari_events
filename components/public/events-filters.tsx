"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { useState, useTransition } from "react";

export function EventsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [price, setPrice] = useState(searchParams.get("price") || "");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "All Categories",
    "Music & Concerts",
    "Business & Professional",
    "Food & Drink",
    "Arts & Culture",
    "Sports & Fitness",
    "Technology",
    "Health & Wellness",
    "Education",
    "Community & Social",
    "Other",
  ];

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (category && category !== "All Categories") params.set("category", category);
    if (price) params.set("price", price);
    
    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPrice("");
    startTransition(() => {
      router.push("/events");
    });
  };

  const hasActiveFilters = search || category || price;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar - Always Visible */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search events by title, location, or venue..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={applyFilters}
            disabled={isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Searching..." : "Search"}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Filters - Desktop Always Visible, Mobile Toggle */}
        <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  // Auto-apply on desktop
                  if (window.innerWidth >= 1024) {
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value && e.target.value !== "All Categories") {
                      params.set("category", e.target.value);
                    } else {
                      params.delete("category");
                    }
                    startTransition(() => {
                      router.push(`/events?${params.toString()}`);
                    });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === "All Categories" ? "" : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <select
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (window.innerWidth >= 1024) {
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value) {
                      params.set("price", e.target.value);
                    } else {
                      params.delete("price");
                    }
                    startTransition(() => {
                      router.push(`/events?${params.toString()}`);
                    });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                defaultValue={searchParams.get("sort") || "date"}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  params.set("sort", e.target.value);
                  startTransition(() => {
                    router.push(`/events?${params.toString()}`);
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date (Upcoming First)</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Mobile Apply/Clear Buttons */}
          <div className="lg:hidden flex gap-3 mt-4">
            <button
              onClick={applyFilters}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="hidden lg:flex items-center gap-2 mt-4">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {search && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                Search: {search}
                <button onClick={() => { setSearch(""); applyFilters(); }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                {category}
                <button onClick={() => { setCategory(""); applyFilters(); }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {price && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                {price === "free" ? "Free" : "Paid"}
                <button onClick={() => { setPrice(""); applyFilters(); }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}