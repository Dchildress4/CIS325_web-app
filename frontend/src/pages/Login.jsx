import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (loading) {
      return;
    }

    if (!email.trim() || !password.trim()) {
      return setError("All fields are required");
    }

    setLoading(true);

    try {
      const res = await api.post("/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = res.data;

      if (!token || !user?.id) {
        throw new Error("Invalid server response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);

      navigate("/home", { replace: true });
    }
    
    catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    }
    
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-paper px-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Login
      </h2>

      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md p-6 rounded-lg shadow-md flex flex-col gap-3"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>

        {error && (
          <p className="text-red-500 text-sm text-center m-0">
            {error}
          </p>
        )}

        <div className="text-center text-sm">
          <Link
            to="/reset-password"
            className="text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="text-center text-sm">
          No account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}