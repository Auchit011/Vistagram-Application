import React, { useEffect, useRef, useState } from "react";
import { Settings, Grid, Heart, Bookmark, MessageCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard";

interface Post {
  _id: string;
  userId: {
    username: string;
    profilePic?: string;
    isVerified?: boolean;
  };
  image: { url: string };
  caption?: string;
  location?: string;
  likesCount?: number;
  sharesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  likedByMe?: boolean;
}

interface UserProfile {
  _id: string;
  username: string;
  profilePic?: { url: string } | string;
  bio?: string;
  isVerified?: boolean;
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: loggedInUser, backendURL } = useAuth();

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const [expandedView, setExpandedView] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);

  const token = localStorage.getItem("vistagram_token");
  const isOwnProfile = profileUser?._id === loggedInUser?.id;

  useEffect(() => {
    if (!username || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const resProfile = await axios.get(
          `${backendURL}/api/users/username/${username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfileUser(resProfile.data);

        const resPosts = await axios.get(
          `${backendURL}/api/posts/user/${resProfile.data._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  setPosts(Array.isArray(resPosts.data) ? resPosts.data : []);

        const resFollowers = await axios.get(
          `${backendURL}/api/follow/followers/${resProfile.data._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowers(resFollowers.data || []);

        const resFollowing = await axios.get(
          `${backendURL}/api/follow/following/${resProfile.data._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowing(resFollowing.data || []);

        setIsFollowing(
          (resFollowers.data || []).some(
            (f: UserProfile) => f._id === loggedInUser?.id
          )
        );
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, backendURL, token, loggedInUser]);

  const handleFollow = async () => {
    if (!profileUser?._id) return;
    try {
      await axios.post(
        `${backendURL}/api/follow/follow/${profileUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFollowing(true);
      setFollowers((prev) => [
        ...prev,
        {
          _id: loggedInUser!.id,
          username: loggedInUser!.username,
        } as UserProfile,
      ]);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleUnfollow = async () => {
    if (!profileUser?._id) return;
    try {
      await axios.delete(
        `${backendURL}/api/follow/unfollow/${profileUser._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowing(false);
      setFollowers((prev) => prev.filter((f) => f._id !== loggedInUser!.id));
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };

  useEffect(() => {
    if (expandedView && selectedPostIndex !== null) {
      setTimeout(() => {
        postRefs.current[selectedPostIndex!]?.scrollIntoView({
          behavior: "smooth",
        });
      }, 80);
    }
  }, [expandedView, selectedPostIndex]);

  const getOrderedPosts = () => {
    if (!expandedView || selectedPostIndex === null) return posts;
    const selected = posts[selectedPostIndex];
    return selected
      ? [selected, ...posts.filter((_, i) => i !== selectedPostIndex)]
      : posts;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 text-white">
      {/* Header */}
      <div className="py-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500/50">
                <img
                  src={
                    profileUser?.profilePic &&
                    typeof profileUser.profilePic !== "string"
                      ? profileUser.profilePic.url
                      : (profileUser?.profilePic as string) ||
                        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  }
                  alt={profileUser?.username}
                  className="w-full h-full object-cover"
                />
              </div>
              {profileUser?.isVerified && (
                <span className="absolute -bottom-1 -right-1 bg-blue-500 text-xs rounded-full px-1.5 py-0.5 border-2 border-black">
                  ✓
                </span>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">
              <Settings size={20} />
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold">{profileUser?.username}</h1>
        <p className="text-gray-400 text-sm mb-4">
          {profileUser?.bio || "No bio available"}
        </p>

        <div className="flex gap-6 mb-4">
          {[
            { label: "Posts", value: posts.length },
            { label: "Followers", value: followers.length },
            { label: "Following", value: following.length },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-bold">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          {isOwnProfile ? (
            <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 font-semibold hover:opacity-90">
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  isFollowing
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                <MessageCircle size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: "posts", icon: Grid, label: "Posts" },
          { id: "liked", icon: Heart, label: "Liked" },
          { id: "saved", icon: Bookmark, label: "Saved" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 ${
              activeTab === id
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400"
            } hover:bg-white/5`}
          >
            <Icon size={18} />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Posts */}
      {activeTab === "posts" && (
        <>
          {!expandedView ? (
            <div className="grid grid-cols-3 gap-1 p-1">
              {posts.map((post, index) => (
                <div
                  key={post._id}
                  className="aspect-square overflow-hidden rounded-lg hover:scale-95 transition cursor-pointer"
                  onClick={() => {
                    setSelectedPostIndex(index);
                    setExpandedView(true);
                  }}
                >
                  <img
                    src={post.image.url}
                    alt={post.caption || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setExpandedView(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ←
                </button>
                <span className="text-sm text-gray-400">Posts</span>
              </div>
              {getOrderedPosts().map((post, idx) => (
                <div key={post._id} ref={(el) => (postRefs.current[idx] = el)}>
                  <PostCard post={post}  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty states */}
      {activeTab !== "posts" && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            {activeTab === "liked" ? (
              <Heart size={28} />
            ) : (
              <Bookmark size={28} />
            )}
          </div>
          <p className="font-medium mb-1">No {activeTab} yet</p>
          <p className="text-sm text-gray-500 text-center">
            {activeTab === "liked"
              ? "Posts you like will appear here"
              : "Posts you save will appear here"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
