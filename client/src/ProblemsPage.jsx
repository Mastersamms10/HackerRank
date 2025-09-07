import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CodeEditor from "./CodeEditor";
import ProblemsPanel from "./ProblemsPanel.jsx";
import "./styles/problems.css";
import Timer from "./Timer";

function ProblemsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [teamInfo] = useState({
    team_id: location.state?.team_id || "",
    team_name: location.state?.team_name || ""
  });
  
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');

  // Fetch problems data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching problems for team:", teamInfo.team_id);
      
      const res = await axios.get("http://localhost:3001/problems", {
        params: { team_id: teamInfo.team_id }
      });
      
      console.log("Problems fetched:", res.data);
      setProblems(res.data);
      
    } catch (err) {
      console.error("Error fetching problems:", err);
      setError(`Failed to load problems: ${err.message}`);
      setProblems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load submission data for selected problem
  const loadSubmissionData = async (problem) => {
    if (!problem || !teamInfo.team_id) return;
    
    try {
      console.log("Loading submission for problem:", problem.id);
      
      const res = await axios.get("http://localhost:3001/submission", {
        params: {
          team_id: teamInfo.team_id,
          problem_id: problem.id
        }
      });
      
      console.log("Submission data loaded:", res.data);
      
      setSubmissions((prev) => ({
        ...prev,
        [problem.id]: {
          code: res.data.code || problem.code || "",
          language: res.data.language || "python"
        }
      }));
      
    } catch (err) {
      console.error("Error loading submission data:", err);
      // Initialize with default values if no submission exists
      setSubmissions((prev) => ({
        ...prev,
        [problem.id]: {
          code: problem.code || "",
          language: "python"
        }
      }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (teamInfo.team_id) {
      fetchData();
    } else {
      setError("No team ID provided");
      setIsLoading(false);
    }
  }, [teamInfo.team_id]);

  // Set selected problem when problems or currentIndex changes
  useEffect(() => {
    if (problems.length > 0 && currentIndex < problems.length) {
      const newSelectedProblem = problems[currentIndex];
      setSelectedProblem(newSelectedProblem);
    }
  }, [problems, currentIndex]);

  // Load submission data when selected problem changes
  useEffect(() => {
    if (selectedProblem) {
      loadSubmissionData(selectedProblem);
    }
  }, [selectedProblem, teamInfo.team_id]);

  const handleCodeChange = (code) => {
    if (selectedProblem) {
      setSubmissions((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          ...prev[selectedProblem.id],
          code: code
        }
      }));
    }
  };

  const handleLanguageChange = (lang) => {
    
    if (selectedProblem) {
      setSubmissions((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          ...prev[selectedProblem.id],
          language: lang
        }
      }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedProblem) {
        alert("No problem selected.");
        return;
    }

    const submission = submissions[selectedProblem.id];
    if (!submission || !submission.code.trim()) {
        alert("No code submitted for this problem.");
        return;
    }

    // Determine Judge0 language ID
    const langId =
        submission.language === "java" ? 62 :
        submission.language === "javascript" ? 93 :
        submission.language === "c" ? 50 :
        submission.language === "python" ? 71 : null;

    if (langId === null) {
        alert("Unsupported language selected.");
        return;
    }

    setIsSubmitting(true);
    let executionOutput = '';
    let executionStatus = '';
    const encode = (str) => btoa(unescape(encodeURIComponent(str)));

    const response = await axios.post(
  "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true",
  {
    source_code: encode(submission.code),
    language_id: langId,
    stdin: selectedProblem.sample_input
  },
  {
    headers: {
      "Content-Type": "application/json"
    }
  }
);
       const decode = (str) => str ? decodeURIComponent(escape(atob(str))) : "";

const result = response.data;
executionStatus = result.status.description;

if (result.status.id === 6) {
  executionOutput = decode(result.compile_output) || "Compilation Error";
} else if (result.status.id >= 7 && result.status.id <= 11) {
  executionOutput = decode(result.stderr) || "Runtime Error";
} else {
  executionOutput = decode(result.stdout) || "No output.";
}
    // Step 3: Update local state for display
    setOutput(executionOutput);
    setStatus(executionStatus);

    // Step 4: Submit results to your local server
    try {
        console.log("Submitting to local server:", {
            team_id: teamInfo.team_id,
            problem_id: selectedProblem.id,
            language: submission.language,
            code: submission.code,
            Output: executionOutput,
            status: executionStatus
        });
        
        await axios.post("http://localhost:3001/submit", {
            team_id: teamInfo.team_id,
            team_name: teamInfo.team_name,
            problem_id: selectedProblem.id,
            language: submission.language,
            code: submission.code,
            Output: executionOutput,
            status: executionStatus
        });

        // Move to next problem or finish
        if (currentIndex < problems.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            alert("All problems submitted!");
            navigate("/");
        }

    } catch (err) {
        console.error("Submission to local server failed:", err);
        alert(`Submission failed: ${err.response?.data?.error || err.message}`);
    } finally {
        setIsSubmitting(false);
    }
};

  // Show loading state
  if (isLoading) {
    return (
      <div className="problems-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading problems...</h2>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="problems-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  // Show no problems state
  if (problems.length === 0) {
    return (
      <div className="problems-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>No problems available</h2>
          <button onClick={fetchData}>Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="problems-page">
      <header>
        <img src="/src/assets/spectrum.jpg" alt="Spectrum" />
        <h2>{teamInfo.team_name} - {teamInfo.team_id}</h2>
        <Timer onTimeUp={handleSubmit} className="timer" />
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !selectedProblem}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <h4>
          Problem {currentIndex + 1} of {problems.length}: {selectedProblem?.title || "None"}
        </h4>
      </header>
      
      <main>
        <ProblemsPanel problems={selectedProblem ? [selectedProblem] : []} />
        
        <div className="right-half">
          {selectedProblem && submissions[selectedProblem.id] && (
            <CodeEditor
              initialCode={submissions[selectedProblem.id].code || ""}
              initialLanguage={submissions[selectedProblem.id].language || "python"}
              onCodeChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default ProblemsPage;