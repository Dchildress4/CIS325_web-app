import { useState } from "react";
import api from "../api/axios";

export default function Messages() {
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const currentUserId = Number(localStorage.getItem("userId") || 0);

  const fetchMessages = async () => {
    if (!receiver?.trim()) return;

    try {
      const res = await api.get(`/messages/${currentUserId}/${Number(receiver)}`);
      setMessages(res.data);
    }
    
    catch (err) {
      console.error(err);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!receiver.trim() || !message.trim()) {
      return alert("All fields required");
    }
    
    await api.post("/messages", {
      receiver_id: Number(receiver),
      message,
    });

    if (!receiver) {
      return;
    }

    setMessage("");
    fetchMessages();
  };

  return (
    <div>
      <h2>Messages</h2>

      <input
        placeholder="Receiver ID"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />

      <button onClick={fetchMessages}>Load Messages</button>

      <hr />

      {messages.map((m) => (
        <div key={m.id}>
          <strong>
            {m.sender_id === currentUserId ? "You: " : "Them: "}
          </strong>
          {m.message}
        </div>
      ))}

      <input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}