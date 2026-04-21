import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      return "All fields required";
    }

    if (password.trim().length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.post("/users/reset-password", {
        email: email.trim(),
        newPassword: password.trim(),
      });

      setSuccess("Password reset successful");

      setEmail("");
      setPassword("");

      setTimeout(() => navigate("/"), 1000);
      setTimeout(() => setSuccess(""), 3000);
    }
    
    catch {
      setError("Failed to reset password");
    }
    
    finally {
      setLoading(false);
    }
  };

  const isWeakPassword = password && password.length < 6;

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-paper px-4">
      <h2 className="text-2xl font-semibold mb-6">
        Reset Password
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-6 rounded-lg shadow-md flex flex-col gap-3"
      >
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Enter new password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
        />

        {isWeakPassword && (
          <p className="text-yellow-600 text-sm">
            Password is too weak
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-600 text-sm text-center">
            {success}
          </p>
        )}
      </form>
    </div>
  );
}