import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/friendships");
      setFriends(res.data);
    }
    
    catch{
      toast.error("Failed to load friends");
    }
    
    finally {
      setLoading(false);
    }
  };

  const sendRequest = async () => {
    const id = Number(receiverId);

    if (!receiverId.trim() || Number.isNaN(id) || id <= 0) {
      return toast.error("Enter a valid user ID");
    }

    if (sending) {
      return;
    }

    setSending(true);

    try {
      await api.post("/friendships", {
        receiver_id: id,
      });

      toast.success("Friend request sent");

      setReceiverId("");
      load();
    }
    
    catch (err) {
      toast.error(err.response?.data?.error || "Request failed");
    }
    
    finally {
      setSending(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-paper">
      <h2 className="text-2xl font-semibold mb-6">Friends</h2>

      <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-md flex flex-col gap-3 mb-6">
        <Input
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          placeholder="User ID"
        />

        <Button onClick={sendRequest} disabled={sending}>
          {sending ? "Sending..." : "Send Request"}
        </Button>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">
            Loading...
          </p>
        ) : friends.length === 0 ? (
          <p className="text-center text-gray-500">
            No friend requests yet
          </p>
        ) : (
          friends.map((f) => (
            <div
              key={f.id}
              className="bg-white p-4 rounded-lg shadow-sm"
            >
              <p className="text-sm">
                <strong>{f.requester_id}</strong> →{" "}
                <strong>{f.receiver_id}</strong>
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Status: {f.status}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}