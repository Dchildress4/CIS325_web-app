import { useState } from "react";
import api from "../api/axios";

export default function ChangePassword() {
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      return alert("Password is required");
    }

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
  };

  return (
    <div>
      <h2>Change Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          value={password}
          type="password"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}