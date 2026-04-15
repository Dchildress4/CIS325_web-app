import { useState } from "react";
import api from "../api/axios";

export default function Posts() {
  const [content, setContent] = useState("");

  const createPost = async () => {
    await api.post("/posts", { content });
    alert("Post created");
    setContent("");
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
    </div>
  );
}