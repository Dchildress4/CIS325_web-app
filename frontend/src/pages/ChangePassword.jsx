import { useState } from "react";
import api from "../api/axios";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      return alert("Password is required");
    }

    if (password.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      await api.put("/users/password", {
        newPassword: password,
      });

      alert("Password updated");
      setPassword("");
    }
    
    catch {
      alert("Error updating password");
    }
    
    finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Change Password</h2>
      <p>Enter a new password</p>

      <form onSubmit={handleSubmit}>
        <input
          value={password}
          type="password"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Submit"}
        </button>
      </form>
    </div>
  );
}