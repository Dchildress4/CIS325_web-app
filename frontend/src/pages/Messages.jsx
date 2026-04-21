import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Messages() {
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const currentUserId = Number(localStorage.getItem("userId") || 0);

  const fetchMessages = async () => {
    const receiverId = Number(receiver);

    if (!receiver.trim() || Number.isNaN(receiverId) || receiverId <= 0) {
      return toast.error("Enter a valid receiver ID");
    }

    setLoading(true);

    try {
      const res = await api.get(
        `/messages/${currentUserId}/${receiverId}`
      );

      setMessages(res.data);
    }
    
    catch {
      toast.error("Failed to load messages");
      setMessages([]);
    }
    
    finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const receiverId = Number(receiver);

    if (!receiver.trim() || !message.trim()) {
      return toast.error("All fields required");
    }

    if (sending) {
      return;
    }

    setSending(true);

    try {
      await api.post("/messages", {
        receiver_id: receiverId,
        message,
      });

      setMessage("");

      const res = await api.get(
        `/messages/${currentUserId}/${receiverId}`
      );
      setMessages(res.data);
    }
    
    catch (err) {
      toast.error(err.response?.data?.error || "Failed to send message");
    }
    
    finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-paper">
      <h2 className="text-2xl font-semibold mb-6">Messages</h2>

      <div className="bg-white w-full max-w-md p-4 rounded-lg shadow-md flex flex-col gap-3">
        <input
          placeholder="Receiver ID"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={fetchMessages}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Loading..." : "Load Messages"}
        </button>

        <div className="flex gap-2">
          <input
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={sendMessage}
            disabled={sending}
            className={`px-4 py-2 rounded text-white transition ${
              sending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      <div className="w-full max-w-md mt-6 flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">
            No messages yet
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-lg shadow-sm max-w-[75%] ${
                m.sender_id === currentUserId
                  ? "bg-blue-600 text-white self-end"
                  : "bg-white text-black self-start"
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {m.sender_id === currentUserId ? "You" : "Them"}
              </div>
              <div>{m.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}