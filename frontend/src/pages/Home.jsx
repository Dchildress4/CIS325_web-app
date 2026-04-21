import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/me");
        setUser(res.data.user);
      }
      
      catch {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/");
      }
      
      finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-gray-500 animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-paper text-center">
      <h1 className="text-3xl font-bold text-gray-800">
        Home Page
      </h1>

      {user && (
        <div className="bg-white mt-6 p-6 rounded-lg shadow-md w-full max-w-md text-left">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Welcome, {user.firstName}
          </h2>

          <p className="mb-2">
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Bio:</strong>{" "}
            {user.bio || "No bio provided"}
          </p>
        </div>
      )}
    </div>
  );
}