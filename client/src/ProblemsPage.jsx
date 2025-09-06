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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);


 
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
    [selectedProblem.id]: res.data
  }));
})
.catch((err) => {
  console.error("Error loading initial code:", err);
  setInitialCode("");

});
}, [selectedProblem]);
  useEffect(() => {
    fetchData();
  }, []);
useEffect(() => {
  if (problems.length > 0 && currentIndex < problems.length) {
    setSelectedProblem(problems[currentIndex]);
  }
}, [problems, currentIndex]);

  const handleCodeChange = (code) => {
  if (selectedProblem) {
    setSubmissions((prev) => ({
      ...prev,
      [selectedProblem.id]: { code, language: language || "python" }
    }));
  }
};
const fetchData = async () => {
  try{
  const res = await axios.get("http://localhost:3001/problems", {
    params: { team_id: teamInfo.team_id }
  });
  setProblems(res.data);
}
  catch (err) {
    console.error("Error fetching problems:", err);
    setProblems([]); // fallback
  }
};

const handleSubmit = async () => {
  const currentProblem = problems[currentIndex];
  const submission = submissions[currentProblem?.id];
  if (!submission || !submission.code) {
    alert("No code submitted for this problem.");
    return;
  }

  try{
  await axios.post("http://localhost:3001/submit", {
    team_id: teamInfo.team_id,
    team_name: teamInfo.team_name,
    problem_id: currentProblem.id,
    language: submission.language,
    code: submission.code
  });
  if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("All problems submitted!");
      navigate("/");
    }
}
  catch (err) {
    console.error("Submission failed:", err);
    alert("Submission failed. Try again.");
  }
  finally {
    setIsSubmitting(false); 
  }
};


  return (
    <div className="problems-page">
      <header>
        <img src="\src\assets\spectrum.jpg" alt="Spectrum" />
        <h2>{teamInfo.team_name}  {teamInfo.team_id}</h2>
        <Timer onTimeUp={handleSubmit} className="timer" />
       <button 
  onClick={handleSubmit} 
  disabled={isSubmitting}
>
  {isSubmitting ? "Submitting..." : "Submit"}
</button>
        <h4>Selected Problem: {selectedProblem?.title || "None"}</h4>
        {/* <button onClick={fetchData}>Load Next Problems</button> */}
      </header>
      <main>
        <ProblemsPanel problems={[selectedProblem]} />



        <div className="right-half">
         {selectedProblem && (
  <CodeEditor
    initialCode={
      submissions[selectedProblem.id]?.code ||
      selectedProblem.code ||
      ""
    }
    initialLanguage={
      submissions[selectedProblem.id]?.language || "python"
    }
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
    }}
  />
)}

        </div>
      </main>
    </div>
    
  );
}

export default ProblemsPage;
