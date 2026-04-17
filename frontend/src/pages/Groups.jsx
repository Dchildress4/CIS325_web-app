import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");

  const loadGroups = async () => {
    const res = await api.get("/groups");
    setGroups(res.data);
  };

  const createGroup = async () => {
    await api.post("/groups", { name, description: "", is_private: 0 });
    setName("");
    loadGroups();
  };

  const joinGroup = async (id) => {
    await api.post("/group-members", { group_id: id });
    alert("Joined group");
  };

  useEffect(() => {
  const loadData = async () => {
    try {
      await loadGroups();
    }
    
    catch (err) {
      console.error(err);
    }
  };

  loadData();
}, []);

  return (
    <div>
      <h2>Groups</h2>

      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={createGroup}>Create</button>

      {groups.map((g) => (
        <div key={g.id}>
          <p>{g.name}</p>
          <button onClick={() => joinGroup(g.id)}>Join</button>
        </div>
      ))}
    </div>
  );
}