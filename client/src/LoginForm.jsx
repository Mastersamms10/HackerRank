import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/login.css";

function LoginForm() {
  const [team_id, setTeamId] = useState("");
  const [team_name, setTeamName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (team_id === "admin" && team_name === "admin") {
    // Admin login flow
    axios.post("http://localhost:3001/admin/login", { username: team_id, password: team_name })
      .then(() => {
        localStorage.setItem("isAdmin", "true");
        navigate("/admin",{state:{replace: true}});
      })
      .catch(() => alert("Admin login failed"));
    }
    else{
    axios.post("http://localhost:3001/login", { team_id, team_name })
      .then(() => {
        
        navigate("/problems", {
  state: { team_id, team_name },
  replace: true
});

      })
      .catch(() => alert("Login failed"));
    }
  };

  const handleRegister = () => {
    axios.post("http://localhost:3001/register", { team_id, team_name })
      .then(() => {
        alert("Team registered successfully!");
        setIsRegistering(false); // Switch back to login mode
      })
      .catch(err => {
        if (err.response?.status === 409) {
          alert("Team ID already exists");
        } else {
          alert("Registration failed");
        }
      });
  };

  useEffect(() => {
  const handlePopState = () => {
    window.history.pushState(null, "", window.location.href);
  };

  window.history.pushState(null, "", window.location.href);
  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

  return (
    <div className="login-container">
      <div className="background-text">HackerRank</div>
        <img src="\src\assets\spectrum.jpg" className="Spectrum-background"></img>       
      
      <div className="login-box">
        <h2 className="login-title">
          {isRegistering ? " Register Team" : " Team Login"}
        </h2>
        <input
          className="login-input"
          placeholder="Team ID"
          value={team_id}
          onChange={e => setTeamId(e.target.value)}
        />

        <input
          className="login-input"
          placeholder="Team Name"
          value={team_name}
          onChange={e => setTeamName(e.target.value)}
        />

        <button
          onClick={isRegistering ? handleRegister : handleSubmit}
          className="login-button"
        >
          {isRegistering ? "Register" : "Login"}
        </button>

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="login-button"
        >
          {isRegistering ? "Already registered? Login" : "New team? Register"}
        </button>
        
      </div>
    </div>
  );
}

export default LoginForm;
