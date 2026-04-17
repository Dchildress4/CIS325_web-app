import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Posts() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await api.get("/posts");
        setPosts(res.data);
      }
      
      catch (err) {
        console.error("Failed to load posts:", err);
        setPosts([]);
      }
    };

    loadPosts();
  }, []);

  const createPost = async () => {
    if (!content.trim()) {
      return;
    }

    try {
      await api.post("/posts", { content });
      setContent("");

      const res = await api.get("/posts");
      setPosts(res.data);
    }
    
    catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  return (
    <div>
      <h2>Posts</h2>

      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a post"
      />

      <button onClick={createPost}>Create</button>

      <hr />

      {posts.map((p) => (
        <div key={p.id}>
          <p>
            <strong>{p.firstName} {p.lastName}:</strong> {p.content}
          </p>
        </div>
      ))}
    </div>
  );
}