import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CodeEditor from "./CodeEditor";
import Timer from "./Timer";
import ProblemsPanel from "./ProblemsPanel.jsx";
import "./styles/problems.css";

function ProblemsPage() {
  const navigate = useNavigate();

  const location = useLocation();
  const [teamInfo] = useState({
    team_id: location.state?.team_id || "",
    team_name: location.state?.team_name || ""
  });
  const [submissions, setSubmissions] = useState({});
const [initialCode, setInitialCode] = useState("");

  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [submittedCode, setSubmittedCode] = useState("");
  const [language, setLanguage] = useState("javascript");

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
  useEffect(() => {
  if (!selectedProblem) return;

  axios.get("http://localhost:3001/submission", {
    params: {
      team_id: teamInfo.team_id,
      problem_id: selectedProblem.id
    }
  })
  .then((res) => {


  setInitialCode(res.data.code || "");


  setSubmissions((prev) => ({
    ...prev,

  }));
})
.catch((err) => {
  console.error("Error loading initial code:", err);
  setInitialCode("");

});
}, [selectedProblem]);
  useEffect(() => {
    // async function fetchData() {
    //   const res = await axios.get("http://localhost:3001/problems");
    //   setProblems(res.data);
    // }
    fetchData();
  }, []);

  const handleCodeChange = (code) => {
  if (selectedProblem) {
    setSubmissions((prev) => ({
      ...prev,
      [selectedProblem.id]: { code, language }
    }));
  }
};
const fetchData = async () => {
  const res = await axios.get("http://localhost:3001/problems", {
    params: { team_id: teamInfo.team_id }
  });
  setProblems(res.data);
};

const handleAutoSubmit = () => {
  const entries = Object.entries(submissions);

  if (entries.length === 0) {
    alert("Time's up! No code submitted.");
navigate("/", { replace: true });
    return;
  }

  const submitPromises = entries.map(([problem_id, { code, language }]) => {
    return axios.post("http://localhost:3001/submit", {
      team_id: teamInfo.team_id,
      team_name: teamInfo.team_name,
      problem_id,
      language,
      code
    });
  });

  Promise.all(submitPromises)
    .then(() => {
      alert("Time's up! Code auto-submitted.");
navigate("/", { replace: true });
    })
    .catch((err) => {
      console.error("Auto-submission failed:", err);
      alert("Auto-submission failed. Please try again.");
    });
};
    const handleSubmit = () => {
  const entries = Object.entries(submissions);

  if (entries.length === 0) {
    alert("No code submitted for any problem.");
    return;
  }

  const submitPromises = entries.map(([problem_id, { code, language }]) => {
    return axios.post("http://localhost:3001/submit", {
      team_id: teamInfo.team_id,
      team_name: teamInfo.team_name,
      problem_id,
      language,
      code
    });
  });

  Promise.all(submitPromises)
    .then(() => {
      alert("All submissions successful!");
      navigate("/");
    })
    .catch((err) => console.error("Submission failed:", err));
  
};


  return (
    <div className="problems-page">
      <header>
        <img src="\src\assets\spectrum.jpg" alt="Spectrum" />
        <h2>{teamInfo.team_name}  {teamInfo.team_id}</h2>
        <Timer onTimeUp={handleAutoSubmit} className="timer" />
        <button onClick={handleSubmit}>Submit</button>
        <h4>Selected Problem: {selectedProblem?.title || "None"}</h4>
        {/* <button onClick={fetchData}>Load Next Problems</button> */}
      </header>
      <main>
        <ProblemsPanel problems={problems} onSelectProblem={setSelectedProblem} />
        <div className="right-half">
          <CodeEditor
  initialCode={submissions[selectedProblem?.id]?.code || selectedProblem?.code || ""}
  onCodeChange={handleCodeChange}
  onLanguageChange={(lang) => {
    if (selectedProblem) {
      setSubmissions((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          ...prev[selectedProblem.id],
          language: lang
        }
      }));
    }
    setLanguage(lang);
  }}
/>
        </div>
      </main>
    </div>
    
  );
}

export default ProblemsPage;
