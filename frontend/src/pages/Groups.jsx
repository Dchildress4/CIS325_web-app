import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const loadGroups = async () => {
    setLoading(true);

    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    }
    
    catch {
      toast.error("Failed to load groups");
    }
    
    finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!name.trim()) {
      return toast.error("Group name is required");
    }

    if (creating) {
      return;
    }

    setCreating(true);

    try {
      await api.post("/groups", {
        name,
        description: "",
        is_private: 0,
      });

      toast.success("Group created");
      setName("");
      loadGroups();
    }
    
    catch (err) {
      toast.error(err.response?.data?.error || "Failed to create group");
    }
    
    finally {
      setCreating(false);
    }
  };

  const joinGroup = async (id) => {
    if (joiningId === id) {
      return;
    }

    setJoiningId(id);

    try {
      await api.post("/group-members", { group_id: id });

      toast.success("Joined group");
      loadGroups();
    }
    
    catch (err) {
      toast.error(err.response?.data?.error || "Failed to join group");
    }
    
    finally {
      setJoiningId(null);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-paper">
      <h2 className="text-2xl font-semibold mb-6">Groups</h2>

      <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-md flex flex-col gap-3 mb-6">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name..."
        />

        <Button onClick={createGroup} disabled={creating}>
          {creating ? "Creating..." : "Create Group"}
        </Button>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">
            Loading...
          </p>
        ) : groups.length === 0 ? (
          <p className="text-center text-gray-500">
            No groups yet
          </p>
        ) : (
          groups.map((g) => (
            <div
              key={g.id}
              className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
            >
              <p className="font-medium">{g.name}</p>

              <Button
                onClick={() => joinGroup(g.id)}
                disabled={joiningId === g.id}
              >
                {joiningId === g.id ? "Joining..." : "Join"}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}