import { useState } from "react";
import api from "../api/axios";

export default function Messages() {
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!receiver.trim() || !message.trim()) {
      return alert("All fields required");
    }

    try {
      await api.post("/messages", {
        receiver_id: receiver,
        message
      });

      alert("Message sent");
      setMessage("");
      setReceiver("");
    } catch {
      alert("Error sending message");
    }
  };

  return (
    <div>
      <h2>Messages</h2>

      <input
        placeholder="Receiver ID"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />

      <input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}