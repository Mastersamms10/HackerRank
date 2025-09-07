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
    let langId;
    if(submission.language == "java")
      langId = 62;
    if(submission.language == "javascript")
      langId = 93;
    if(submission.language == "c")
      langId = 50;
    if(submission.language == "python")
      langId = 71;
    const submissionData = {
      source_code: submission.code,
      language_id: langId,
      stdin: selectedProblem.sample_input
    };
    try{
      
     const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?wait=true', {
  method: 'POST',
  headers: {
    'x-rapidapi-key': '499ce3a32amsh2fc4cbe29632234p132566jsnd673b0e56558',
    'Content-Type': 'application/json',
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  },
  body: JSON.stringify(submissionData),
});

if (response.status === 429) {
  console.error("Rate limit exceeded");
  setOutput("Rate limit exceeded. Please wait and try again.");
  setStatus("Error");
  return;
}
      const data = await response.json();

if (data && data.token) {
  const token = data.token;

  // Polling loop
  let result;
  while (true) {
    const resultResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
      headers: {
        'x-rapidapi-key': '499ce3a32amsh2fc4cbe29632234p132566jsnd673b0e56558',
      },
    });
    const result = await response.json();


    if (result.status && result.status.id > 2) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Handle result...
} else {
  console.error("Submission token missing");
  setOutput("Failed to retrieve execution token.");
  setStatus("Error");
  return;
}
    
      if (result.status_id === 3) {
      // Success (Accepted)
      setOutput(result.stdout);
      setStatus(result.status.description);
    } else if (result.status_id === 6) {
      // Compilation Error
      setOutput(result.compile_output || 'No compilation output available.');
      setStatus(result.status.description);
    } else if (result.status_id >= 7 && result.status_id <= 11) {
      // Runtime Errors (or other execution errors)
      setOutput(result.stderr || 'No runtime error details available.');
      setStatus(result.status.description);
    } else {
      // Other statuses (TLE, Wrong Answer, etc.)
      setOutput(result.stdout || result.stderr || 'No output.');
      setStatus(result.status.description);
    }
      
    }
    catch(error)
    {
      console.error('Error:', error);
      setOutput('Failed to execute code.');
      setStatus('Error');
    }
    

    
    

    setIsSubmitting(true);
    
    try {
      console.log("Submitting:", {
        team_id: teamInfo.team_id,
        problem_id: selectedProblem.id,
        language: submission.language,
        code: submission.code
      });

      await axios.post("http://localhost:3001/submit", {
        team_id: teamInfo.team_id,
        team_name: teamInfo.team_name,
        problem_id: selectedProblem.id,
        language: submission.language,
        code: submission.code,
        Output: output,
        status: status
      });

      // Move to next problem or finish
      if (currentIndex < problems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        alert("All problems submitted!");
        navigate("/");
      }
      
    } catch (err) {
      console.error("Submission failed:", err);
      alert(`Submission failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
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