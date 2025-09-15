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
  const [showOutputPanel, setShowOutputPanel] = useState(false);
const [runCount, setRunCount] = useState(0);
const JUDGE0_API_KEY = a953ae1415msh50c64ff10e4b1e3p115f2djsnd6a295eaba08;
const JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com";

  const RUN_LIMIT = 2;

  // Fetch problems data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching problems for team:", teamInfo.team_id);
      
      const res = await axios.get(`${import.meta.env.VITE_DB_URL}/problems`, {
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
      
      const res = await axios.get(`${import.meta.env.VITE_DB_URL}/submission`, {
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
// Reset run counter when a new problem is selected
useEffect(() => {
  setRunCount(0);
}, [selectedProblem?.id]);


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
  if (!selectedProblem) return alert("No problem selected.");

  const submission = submissions[selectedProblem.id];
  if (!submission || !submission.code.trim()) return alert("No code submitted.");

  const langId =
    submission.language === "java" ? 62 :
    submission.language === "javascript" ? 93 :
    submission.language === "c" ? 50 :
    submission.language === "python" ? 71 : null;

  if (langId === null) return alert("Unsupported language selected.");

  setIsSubmitting(true);
  const encode = (str) => btoa(unescape(encodeURIComponent(str)));
  const decode = (str) => (str ? decodeURIComponent(escape(atob(str))) : "");

  try {
    const allCases = [
      ...(selectedProblem.test_cases_public || []),
      ...(selectedProblem.test_cases_hidden || [])
    ];

    let allPassed = true;
    for (const test of allCases) {
      const response = await axios.post(
        `${JUDGE0_BASE_URL}/submissions/?base64_encoded=true&wait=true`,
        {
          source_code: encode(submission.code),
          language_id: langId,
          stdin: test.input
        },
        { headers: {  'Content-Type': 'application/json' ,
          ...(JUDGE0_API_KEY && { "X-RapidAPI-Key": JUDGE0_API_KEY })}
       }
      );

      const result = response.data;
      let output = "";
      if (result.status.id === 6) output = decode(result.compile_output) || "Compilation Error";
      else if (result.status.id >= 7 && result.status.id <= 11) output = decode(result.stderr) || "Runtime Error";
      else output = decode(result.stdout) || "No output.";

      if (output.trim() !== test.expected_output.trim()) {
        allPassed = false;
      }
    }

    const finalStatus = allPassed ? "Accepted" : "Wrong Answer";
    setOutput(`Submission Result: ${finalStatus}`);
    setStatus(finalStatus);

    await axios.post(`${import.meta.env.VITE_DB_URL}/submit`, {
      team_id: teamInfo.team_id,
      team_name: teamInfo.team_name,
      problem_id: selectedProblem.id,
      language: submission.language,
      code: submission.code,
      Output: finalStatus,
      status: finalStatus
    });

    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("All problems submitted!");
      navigate("/");
    }
  } catch (err) {
    console.error("Submit failed:", err);
    alert(`Submit failed: ${err.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

const runCode = async () => {
  if (runCount >= RUN_LIMIT) {
      alert("You have reached the maximum number of runs allowed.");
      return;
    }
    setRunCount(prev => prev +1);
  if (!selectedProblem) return alert("No problem selected.");

  const submission = submissions[selectedProblem.id];
  if (!submission || !submission.code.trim()) return alert("No code to run.");

  const langId =
    submission.language === "java" ? 62 :
    submission.language === "javascript" ? 93 :
    submission.language === "c" ? 50 :
    submission.language === "python" ? 71 : null;

  if (langId === null) return alert("Unsupported language selected.");

  setIsSubmitting(true);
  const encode = (str) => btoa(unescape(encodeURIComponent(str)));
  const decode = (str) => (str ? decodeURIComponent(escape(atob(str))) : "");

  try {
    const results = [];
    for (const test of selectedProblem.test_cases_public || []) {
      const response = await axios.post(
        "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true",
        {
          source_code: encode(submission.code),
          language_id: langId,
          stdin: test.input
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const result = response.data;
      const status = result.status.description;
      let output = "";

      if (result.status.id === 6) output = decode(result.compile_output) || "Compilation Error";
      else if (result.status.id >= 7 && result.status.id <= 11) output = decode(result.stderr) || "Runtime Error";
      else output = decode(result.stdout) || "No output.";

      results.push({
        input: test.input,
        expected: test.expected_output,
        got: output.trim(),
        status,
        passed: output.trim() === test.expected_output.trim()
      });
    }
    setOutput(results);
    setStatus("Run Completed");
setShowOutputPanel(true); // Show output panel after run
  } catch (err) {
    console.error("Run failed:", err);
    alert(`Run failed: ${err.message}`);
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
  onClick={runCode} 
  disabled={isSubmitting || !selectedProblem}
>
  {isSubmitting ? "Running..." : "Run"}
  ({RUN_LIMIT - runCount} left)
</button>
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
       
  

        
          {selectedProblem && submissions[selectedProblem.id] && (
           <CodeEditor
  initialCode={
    selectedProblem
      ? selectedProblem[`starter_code_${submissions[selectedProblem.id]?.language || "python"}`]
      : ""
  }
  initialLanguage={submissions[selectedProblem.id]?.language || "python"}
  onCodeChange={handleCodeChange}
  onLanguageChange={handleLanguageChange}
/>


          )}
     {showOutputPanel && (
  <div className="output-panel">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3>Test Results:</h3>
      <button onClick={() => setShowOutputPanel(false)} style={{ padding: "4px 8px" }}>
        ✖ Close
      </button>
    </div>

    {Array.isArray(output) ? (
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Input</th>
            <th>Expected</th>
            <th>Got</th>
           
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {output.map((res, i) => (
            <tr key={i}>
              <td>{res.input}</td>
              <td>{res.expected}</td>
              <td>{res.got}</td>
              
              <td style={{ color: res.passed ? "green" : "red" }}>
                {res.passed ? "Passed" : "Failed"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <pre>{output}</pre>
    )}
  </div>
)}
      </main>
      
    </div>
  );
}

export default ProblemsPage;