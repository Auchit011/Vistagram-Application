import React, { useEffect, useState } from "react";
import { Search, TrendingUp, MapPin, Users, Clock } from "lucide-react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  _id: string;
  username: string;
  profilePic?: { url: string };
  bio?: string;
  isFollowed: boolean;
}

const Explore: React.FC = () => {
  const { backendURL, user } = useAuth();
  const token = localStorage.getItem("vistagram_token");
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("trending");
  const [users, setUsers] = useState<UserProfile[]>([]);

  const exploreItems = [
    {
      id: 1,
      type: "post",
      image:
        "https://images.pexels.com/photos/1647220/pexels-photo-1647220.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2",
      likes: 2543,
      location: "Swiss Alps",
    },
    {
      id: 2,
      type: "album",
      image:
        "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2",
      memberCount: 12,
      title: "Sunset Beach Vibes",
    },
  ];

  const filters = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "nearby", label: "Nearby", icon: MapPin },
    { id: "albums", label: "Albums", icon: Users },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "users", label: "Users", icon: Users },
  ];

  useEffect(() => {
    if (!user || !token) return;
    if (activeFilter !== "users") return;

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/users/explore`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [activeFilter, backendURL, user, token]);

  const handleFollowToggle = async (u: UserProfile) => {
    try {
      if (u.isFollowed) {
        await axios.delete(`${backendURL}/api/follow/unfollow/${u._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) =>
          prev.map((x) => (x._id === u._id ? { ...x, isFollowed: false } : x))
        );
      } else {
        await axios.post(
          `${backendURL}/api/follow/follow/${u._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers((prev) =>
          prev.map((x) => (x._id === u._id ? { ...x, isFollowed: true } : x))
        );
      }
    } catch (error) {
      console.error("Follow toggle error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-3">
      {/* Search */}
      <div className="sticky top-0 z-10 bg-slate-950 pb-4 pt-2">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places, people, or tags..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
        {filters.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              activeFilter === id
                ? "bg-purple-500 text-white border-transparent"
                : "bg-white/[0.05] text-gray-300 border-white/10 hover:bg-white/[0.1]"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      {activeFilter === "users" ? (
        <div className="grid grid-cols-1 gap-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${u.username}`)}
              >
                <img
                  src={u.profilePic?.url || "https://via.placeholder.com/40x40"}
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{u.username}</p>
                  <p className="text-xs text-gray-400">{u.bio || "No bio"}</p>
                </div>
              </div>
              <button
                onClick={() => handleFollowToggle(u)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  u.isFollowed
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                {u.isFollowed ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {exploreItems.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/10 group cursor-pointer"
            >
              <img
                src={item.image}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                {item.type === "post" ? (
                  <>
                    <p className="text-sm font-medium">
                      {item.likes?.toLocaleString()} likes
                    </p>
                    {item.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-300">
                        <MapPin size={12} />
                        {item.location}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <Users size={12} />
                      {item.memberCount} members
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
