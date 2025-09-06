import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ImagePlus, MapPin, Loader2, Wand2, Edit3 } from "lucide-react";

const Upload: React.FC = () => {
  const { backendURL } = useAuth();
  const token = localStorage.getItem("vistagram_token");
  const navigate = useNavigate();

  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [captionSuggestions, setCaptionSuggestions] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setCaptionSuggestions([]);
      setCaption("");

      // Only auto-generate if user is on auto tab
      if (activeTab === "auto") {
        generateCaptions(file);
      }
    }
  };

  const generateCaptions = async (file: File) => {
    setGeneratingCaptions(true);
    try {
      const base64 = await toBase64(file);

      const { data } = await axios.post(
        `${backendURL}/api/ai/caption`,
        {
          imageBase64: base64.split(",")[1],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data?.captions?.length > 0) {
        setCaption(data.captions[0]); // default to first caption
        setCaptionSuggestions(data.captions);
      }
    } catch (err) {
      console.error("Error generating captions:", err);
    } finally {
      setGeneratingCaptions(false);
    }
  };

  const handleGenerateWithContext = async () => {
    if (!image || !caption.trim()) return;

    setGeneratingCaptions(true);
    try {
      const base64 = await toBase64(image);

      const { data } = await axios.post(
        `${backendURL}/api/ai/caption`,
        {
          imageBase64: base64.split(",")[1],
          context: caption.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data?.captions?.length > 0) {
        setCaptionSuggestions(data.captions);
      }
    } catch (err) {
      console.error("Error generating captions with context:", err);
    } finally {
      setGeneratingCaptions(false);
    }
  };

  const handleTabSwitch = (tab: "manual" | "auto") => {
    setActiveTab(tab);
    setCaptionSuggestions([]);

    // If switching to auto and image exists, generate captions
    if (tab === "auto" && image) {
      generateCaptions(image);
    }
  };

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return setError("Please select an image to upload.");
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("caption", caption);
      formData.append("location", location);

      await axios.post(`${backendURL}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Create a Post</h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-2 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Image Upload */}
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-white/10 rounded-xl p-6 bg-white/[0.03] hover:bg-white/[0.05] cursor-pointer transition">
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="max-h-60 rounded-lg object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <ImagePlus size={40} className="mb-2" />
              <span className="text-sm">Click to select an image</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </label>

        {/* Caption Generation Tabs */}
        {image && (
          <div className="border border-white/10 rounded-lg bg-white/[0.03]">
            {/* Tab Headers */}
            <div className="flex border-b border-white/10">
              <button
                type="button"
                onClick={() => handleTabSwitch("manual")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "manual"
                    ? "bg-purple-500/20 text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <Edit3 size={16} />
                Manual with Context
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch("auto")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "auto"
                    ? "bg-purple-500/20 text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <Wand2 size={16} />
                Auto Generate
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 space-y-4">
              {activeTab === "manual" ? (
                <div className="space-y-3">
                  <textarea
                    placeholder="Write your caption or keywords for context..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                  />

                  {caption.trim() && (
                    <button
                      type="button"
                      onClick={handleGenerateWithContext}
                      disabled={generatingCaptions}
                      className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-sm rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {generatingCaptions ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Generating with Context...
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} />
                          Generate Captions with Context
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {generatingCaptions ? (
                    <div className="flex items-center justify-center text-purple-400 text-sm py-8">
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Generating captions...
                    </div>
                  ) : captionSuggestions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm">Select a caption:</p>
                      <div className="space-y-2">
                        {captionSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCaption(suggestion)}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                              caption === suggestion
                                ? "bg-purple-500/20 text-white border-purple-500"
                                : "bg-white/[0.05] border-white/10 text-gray-300 hover:bg-white/[0.1]"
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-sm py-4">
                      Captions will appear here automatically
                    </div>
                  )}
                </div>
              )}

              {/* Caption Suggestions (for both tabs) */}
              {captionSuggestions.length > 0 && activeTab === "manual" && (
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {captionSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCaption(suggestion)}
                        className={`px-3 py-1 rounded-full border text-sm transition ${
                          caption === suggestion
                            ? "bg-purple-500 text-white border-purple-500"
                            : "bg-white/[0.05] border-white/10 text-gray-300 hover:bg-white/[0.1]"
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Caption Display */}
        {caption && (
          <div className="p-3 bg-white/[0.05] border border-white/10 rounded-lg">
            <p className="text-gray-300 text-xs mb-1">Selected Caption:</p>
            <p className="text-white text-sm">{caption}</p>
          </div>
        )}

        {/* Location */}
        <div className="relative">
          <MapPin
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !caption.trim()}
          className="w-full py-3 rounded-lg bg-purple-500 hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default Upload;
