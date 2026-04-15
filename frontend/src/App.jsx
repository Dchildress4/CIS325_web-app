import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/users" element={<div>Users Page</div>} />
      <Route path="/posts" element={<div>Posts Page</div>} />
      <Route path="/messages" element={<div>Messages Page</div>} />
      <Route path="/friends" element={<div>Friendships Page</div>} />
      <Route path="/groups" element={<div>Groups Page</div>} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="*" 
        element={
          <div>404 - Page not found</div>
        }
      />
    </Routes>
  );
}