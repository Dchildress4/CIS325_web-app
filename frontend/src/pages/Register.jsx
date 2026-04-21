import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    school_level: "",
    disability: "",
    bio: "",
    interests: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!form.firstName.trim()) {
      return "First name required";
    }

    if (!form.lastName.trim()) {
      return "Last name required";
    }

    if (!form.email.trim()) {
      return "Email required";
    }

    if (!form.password.trim()) {
      return "Password required";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    const cleanedForm = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      school_level: form.school_level.trim(),
      disability: form.disability.trim(),
      bio: form.bio.trim(),
      interests: form.interests.trim(),
    };

    try {
      await api.post("/users", cleanedForm);

      toast.success("Account created successfully");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 800);
    }
    
    catch (err) {
      toast.error(
        err.response?.data?.error || "Registration failed"
      );
    }
    
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-paper px-4">
      <h2 className="text-2xl font-semibold mb-6">
        Create Account
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-6 rounded-lg shadow-md flex flex-col gap-3"
      >
        <div className="grid grid-cols-2 gap-2">
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            className="p-2 border rounded"
          />

          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password (min 6 chars)"
          value={form.password}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="school_level"
          placeholder="School Level"
          value={form.school_level}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="disability"
          placeholder="Disability"
          value={form.disability}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <textarea
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
          className="p-2 border rounded resize-none h-20"
        />

        <input
          name="interests"
          placeholder="Interests"
          value={form.interests}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded text-white transition ${
            loading
              ? "bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </div>
  );
}