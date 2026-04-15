import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    school_level: "",
    disability: "",
    bio: "",
    interests: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      return alert("First name, last name, email, and password are required");
    }

    setLoading(true);

    try {
      await api.post("/users", form);

      alert("User created successfully");
      navigate("/");
    }
    
    catch (err) {
      alert(err.response?.data?.error || "Unknown error");
    }
    
    finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="First Name" onChange={handleChange} />
        <input name="lastName" placeholder="Last Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />

        <input name="school_level" placeholder="School Level" onChange={handleChange} />
        <input name="disability" placeholder="Disability" onChange={handleChange} />
        <input name="bio" placeholder="Bio" onChange={handleChange} />
        <input name="interests" placeholder="Interests" onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Submit"}
        </button>
      </form>
    </div>
  );
}