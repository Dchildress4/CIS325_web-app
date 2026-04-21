import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Posts() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadPosts = async () => {
    setFetching(true);

    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    }
    
    catch {
      toast.error("Failed to load posts");
    }
    
    finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const createPost = async () => {
    const trimmed = content.trim();

    if (!trimmed) {
      return toast.error("Post cannot be empty");
    }

    if (creating) {
      return;
    }

    setCreating(true);

    try {
      const res = await api.post("/posts", { content: trimmed });

      setPosts((prev) => [res.data, ...prev]);
      setContent("");
    }
    
    catch (err) {
      toast.error(err.response?.data?.error || "Failed to create post");
    }
    
    finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-paper">
      <h2 className="text-2xl font-semibold mb-6">Posts</h2>

      <div className="bg-white w-full max-w-md p-4 rounded-lg shadow-md flex flex-col gap-3 mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="p-2 border rounded resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={createPost}
          disabled={creating}
          className={`py-2 rounded text-white transition ${
            creating
              ? "bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {creating ? "Posting..." : "Create Post"}
        </button>
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">
        {fetching ? (
          <p className="text-center text-gray-500 animate-pulse">
            Loading posts...
          </p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">
            No posts yet
          </p>
        ) : (
          posts.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="font-semibold text-blue-600 mb-2">
                {p.firstName} {p.lastName}
              </div>

              <div className="text-gray-800 whitespace-pre-wrap">
                {p.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}