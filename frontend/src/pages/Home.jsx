import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
      
      catch (err) {
        console.log(err);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Home page</h1>

      {user && (
        <div>
          <h2>Welcome, {user.firstName}</h2>
          <p>Email: {user.email}</p>
          <p>Bio: {user.bio}</p>
        </div>
      )}

      <hr />

      <button onClick={() => navigate("/posts")}>Posts</button>
      <button onClick={() => navigate("/messages")}>Messages</button>
      <button onClick={() => navigate("/friends")}>Friends</button>
      <button onClick={() => navigate("/groups")}>Groups</button>

      <br /><br />

      <button onClick={() => navigate("/change-password")}>
        Change Password
      </button>

      <button onClick={logout} style={{ marginLeft: "10px" }}>
        Logout
      </button>
    </div>
  );
}