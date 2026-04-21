import { Outlet, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <nav className="flex gap-3 p-3 border-b bg-white shadow-sm">
        <button className="px-3 py-1 rounded hover:bg-gray-200" onClick={() => navigate("/home")}>
          Home
        </button>
        <button className="px-3 py-1 rounded hover:bg-gray-200" onClick={() => navigate("/posts")}>
          Posts
        </button>
        <button className="px-3 py-1 rounded hover:bg-gray-200" onClick={() => navigate("/messages")}>
          Messages
        </button>
        <button className="px-3 py-1 rounded hover:bg-gray-200" onClick={() => navigate("/friends")}>
          Friends
        </button>
        <button className="px-3 py-1 rounded hover:bg-gray-200" onClick={() => navigate("/groups")}>
          Groups
        </button>
        <button className="px-3 py-1 rounded hover:bg-gray-200" onClick={() => navigate("/change-password")}>
          Change Password
        </button>
        <button className="ml-auto px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600" onClick={logout}>
          Logout
        </button>
      </nav>

      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}