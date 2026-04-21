import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Input from "../components/Input";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (loading) {
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/change-password", {
        oldPassword,
        newPassword,
      });

      toast.success("Password updated successfully");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    
    catch (err) {
      const msg =
        err.response?.data?.error || "Failed to update password";

      setError(msg);
      toast.error(msg);
    }
    
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-paper">
      <h2 className="text-2xl font-semibold mb-6">Change Password</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md flex flex-col gap-3"
      >
        <Input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {newPassword && newPassword.length < 6 && (
          <p className="text-yellow-600 text-sm">
            Password should be at least 6 characters
          </p>
        )}

        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}