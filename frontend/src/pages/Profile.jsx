import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { request } from "../services/api";

export default function Profile() {
  const { user } = useAuth();

  const [f, setF] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user) {
      setF({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      });
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const save = async (e) => {
    e.preventDefault();

    try {
      await request("/users/profile", {
        method: "PUT",
        body: JSON.stringify(f),
      });

      setMsg("Profile updated successfully.");
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="page narrow">
      <div className="page-title">
        <span className="eyebrow">MY ACCOUNT</span>
        <h1>Profile</h1>
      </div>

      <form className="form-card" onSubmit={save}>
        <label>
          Full Name
          <input
            type="text"
            value={f.name}
            onChange={(e) =>
              setF({ ...f, name: e.target.value })
            }
          />
        </label>

        <label>
          Phone
          <input
            type="tel"
            value={f.phone}
            onChange={(e) =>
              setF({ ...f, phone: e.target.value })
            }
          />
        </label>

        <label>
          Address
          <input
            type="text"
            value={f.address}
            onChange={(e) =>
              setF({ ...f, address: e.target.value })
            }
          />
        </label>

        <label>
          City
          <input
            type="text"
            value={f.city}
            onChange={(e) =>
              setF({ ...f, city: e.target.value })
            }
          />
        </label>

        <button type="submit" className="btn-primary">
          Save Changes
        </button>

        {msg && <div className="notice">{msg}</div>}
      </form>
    </div>
  );
}