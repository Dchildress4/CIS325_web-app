import { useState } from "react";
import api from "../api/axios";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      return alert("All fields required");
    }

    if (password.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      await api.post("/users/reset-password", {
        email,
        newPassword: password,
      });

      alert("Password reset successful");
      setEmail("");
      setPassword("");
    }
    
    catch {
      alert("Error resetting password");
    }
    
    finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <p>Enter your email and new password</p>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset"}
        </button>
      </form>
    </div>
  );
}