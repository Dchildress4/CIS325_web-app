import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [receiverId, setReceiverId] = useState("");

  const load = async () => {
    const res = await api.get("/friendships");
    setFriends(res.data);
  };

  const sendRequest = async () => {
    await api.post("/friendships", { receiver_id: Number(receiverId) });
    setReceiverId("");
    load();
  };

  useEffect(() => {
  const loadData = async () => {
    try {
      await load();
    }
    
    catch (err) {
      console.error(err);
    }
  };

  loadData();
}, []);

  return (
    <div>
      <h2>Friends</h2>

      <input
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        placeholder="User ID"
      />
      <button onClick={sendRequest}>Send Request</button>

      {friends.map((f) => (
        <div key={f.id}>
          <p>
            {f.requester_id} → {f.receiver_id} ({f.status})
          </p>
        </div>
      ))}
    </div>
  );
}