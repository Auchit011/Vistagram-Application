import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  MapPin,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";


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


interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { backendURL } = useAuth();
  const token = localStorage.getItem("vistagram_token");
  const navigate = useNavigate();

  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
  const [liked, setLiked] = useState(!!post.likedByMe);
  const [sharesCount, setSharesCount] = useState(post.sharesCount ?? 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    setLikesCount(post.likesCount ?? 0);
    setLiked(!!post.likedByMe);
    setSharesCount(post.sharesCount ?? 0);
    setCommentsCount(post.commentsCount ?? 0);
  }, [post]);

  const handleLike = async () => {
    if (!token) return;
    setLiking(true);
    const prevLiked = liked;
    setLiked(!prevLiked);
    setLikesCount((prev) => prev + (prevLiked ? -1 : 1));

    try {
      const res = await axios.post(
        `${backendURL}/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (typeof res.data.likesCount === "number")
        setLikesCount(res.data.likesCount);
      if (typeof res.data.liked === "boolean") setLiked(res.data.liked);
    } catch {
      setLiked(prevLiked);
      setLikesCount((prev) => prev + (prevLiked ? 1 : -1));
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (!token) return;
    setSharing(true);
    try {
      const res = await axios.post(
        `${backendURL}/api/posts/${post._id}/share`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.shareUrl) {
        await navigator.clipboard.writeText(res.data.shareUrl);
        alert("Share link copied!");
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden mb-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate(`/profile/${post.userId.username}`)}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
          >
            <img
              src={
                post.userId.profilePic ||
                "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              }
              alt={post.userId.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div
              onClick={() => navigate(`/profile/${post.userId.username}`)}
              className="font-medium cursor-pointer hover:underline"
            >
              {post.userId.username}
            </div>
            {post.location && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={12} />
                {typeof post.location === "string"
                  ? post.location
                  : post.location.name || JSON.stringify(post.location) || "Unknown location"}
              </div>
            )}
          </div>
        </div>
        <MoreHorizontal className="text-gray-400 hover:text-white cursor-pointer" />
      </div>

      {/* Image */}
      <div className="relative">
        <img
          src={post.image.url}
          alt={post.caption || "Post image"}
          className="w-full object-cover aspect-square"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`transition-transform hover:scale-110 ${
                liked ? "text-pink-400" : "text-gray-300"
              }`}
            >
              <Heart size={24} fill={liked ? "currentColor" : "none"} />
            </button>
            <button className="text-gray-300 hover:text-white">
              <MessageCircle size={24} />
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="text-gray-300 hover:text-white"
            >
              <Share size={24} />
            </button>
          </div>
          <p className="text-xs text-gray-400">
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : ""}
          </p>
        </div>

        {/* Stats */}
        <p className="font-semibold text-sm mb-1">
          {likesCount.toLocaleString()} likes
        </p>
        <p className="text-xs text-gray-400 mb-2">
          {sharesCount} shares • {commentsCount} comments
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold mr-2">{post.userId.username}</span>
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
};

export default PostCard;
