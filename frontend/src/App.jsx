import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import Messages from "./pages/Messages";
import Friends from "./pages/Friends";
import Groups from "./pages/Groups";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
      <Route path="/home" element={<Home />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/friends" element={<Friends />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/change-password" element={<ChangePassword />} />
      </Route>
      </Route>

      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}