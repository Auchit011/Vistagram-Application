import React, { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";
import { Globe, Heart, MapPin, X } from "lucide-react";

interface Post {
  _id: string;
  userId: {
    username: string;
    profilePic?: string;
    isVerified?: boolean;
  };
  image: {
    url: string;
  };
  caption?: string;
  location?: string;
  likesCount?: number;
  sharesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  likedByMe?: boolean;
}

type FilterType = "all" | "location" | "popular";

const Home: React.FC = () => {
  const { user, backendURL } = useAuth();
  const token = localStorage.getItem("vistagram_token");

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");

  // Fetch posts once on component mount
  useEffect(() => {
    if (!user || !token) return;

    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${backendURL}/api/posts/feed`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 50 },
        });
        setAllPosts(res.data.posts);
      } catch (err) {
        setError("Failed to load posts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [user, token, backendURL]);

  // Apply filters whenever posts, filter type, or search queries change
  useEffect(() => {
  if (!Array.isArray(allPosts) || !allPosts.length) {
      setFilteredPosts([]);
      return;
    }

    let filtered = [...allPosts];

    // First apply the main filter
    switch (activeFilter) {
      case "popular":
        filtered = filtered.sort(
          (a, b) => (b.likesCount || 0) - (a.likesCount || 0)
        );
        break;
      case "location":
        // For location filter, only show posts that have a location
        filtered = filtered.filter(
          (post) =>
            post.location &&
            post.location !== "" &&
            post.location !== "unknown"
        );

        // If there's a location search query, filter by it
        if (locationSearchQuery.trim()) {
          const query = locationSearchQuery.toLowerCase().trim();
          filtered = filtered.filter((post) => {
            const locationStr =
              typeof post.location === "string"
                ? post.location.toLowerCase()
                : "";
            return locationStr.includes(query);
          });

        }
        break;
      case "all":
      default:
        // Keep all posts
        break;
    }

    // Apply general search query (for non-location filters)
    if (searchQuery.trim() && activeFilter !== "location") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (post) =>
          post.userId.username.toLowerCase().includes(query) ||
          (post.caption && post.caption.toLowerCase().includes(query)) ||
          (post.location && post.location.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(filtered);
  }, [allPosts, activeFilter, searchQuery, locationSearchQuery]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setSearchQuery("");
    setLocationSearchQuery("");
  };

  const clearLocationSearch = () => {
    setLocationSearchQuery("");
  };

  const getFilterLabel = () => {
    switch (activeFilter) {
      case "popular":
        return "Most Liked";
      case "location":
        return "By Location";
      default:
        return "All Posts";
    }
  };

  const getEmptyStateMessage = () => {
    if (activeFilter === "location" && locationSearchQuery) {
      return `No posts found for "${locationSearchQuery}"`;
    }
    if (activeFilter === "location" && !locationSearchQuery) {
      return "Search for a location to see posts from that area";
    }
    if (activeFilter === "popular") {
      return "No posts to show";
    }
    if (searchQuery) {
      return `No results found for "${searchQuery}"`;
    }
    return "No posts yet — follow more people or share your first photo!";
  };

  const filterTabs = [
    { id: "all" as FilterType, label: "All", icon: Globe },
    { id: "location" as FilterType, label: "Location", icon: MapPin },
    { id: "popular" as FilterType, label: "Popular", icon: Heart },
  ];

  return (
    <div className="max-w-md mx-auto px-3">
      {/* Filter Tabs */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 mb-4 -mx-3 px-3 py-3">
        <div className="flex gap-1 mb-3">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === tab.id
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] hover:text-white"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Location Search Bar - Only shown when location filter is active */}
        {activeFilter === "location" && (
          <div className="mb-3">
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                placeholder="Enter location (e.g., Paris, New York, Beach)..."
                className="w-full pl-10 pr-10 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              {locationSearchQuery && (
                <button
                  onClick={clearLocationSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Type any location name to filter posts from that area
            </div>
          </div>
        )}

        {/* General Search Bar - For all other filters */}
        {/* {activeFilter !== "location"&& (
            <div className="mb-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts, users, captions..."
                  className="w-full pl-10 pr-10 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={clearGeneralSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )} */}

        {/* Results Info */}
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>
            {activeFilter === "location" && locationSearchQuery
              ? `${filteredPosts.length} results for "${locationSearchQuery}"`
              : activeFilter === "location" && !locationSearchQuery
              ? "Enter a location to search"
              : searchQuery
              ? `${filteredPosts.length} results found`
              : `Showing ${getFilterLabel()}`}
          </span>
          {filteredPosts.length > 0 && (
            <span>{filteredPosts.length} posts</span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-400 py-8">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading posts...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPosts.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">{getEmptyStateMessage()}</div>
          <div className="text-xs text-gray-400">
            {activeFilter === "location" && !locationSearchQuery && (
              <>
                <MapPin size={16} className="inline mb-1 mr-1" />
                Try searching for cities, landmarks, or any location name
              </>
            )}
            {activeFilter === "location" &&
              locationSearchQuery &&
              "Try a different location or check the spelling"}
            {activeFilter === "popular" &&
              "Create popular content to see it here!"}
            {searchQuery &&
              activeFilter !== "location" &&
              "Try different search terms"}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {/* Load More Indicator */}
      {filteredPosts.length > 0 && !loading && (
        <div className="text-center py-4 text-xs text-gray-500">
          {activeFilter === "location" && locationSearchQuery
            ? `Found ${filteredPosts.length} posts in "${locationSearchQuery}"`
            : filteredPosts.length === allPosts.length
            ? `Showing all ${filteredPosts.length} posts`
            : `Showing ${filteredPosts.length} of ${allPosts.length} posts`}
        </div>
      )}
    </div>
  );
};

export default Home;
