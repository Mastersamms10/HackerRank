import "./styles/problems.css";

function ProblemsPanel({ problems = [] }) {
  if (!problems || problems.length === 0) {
    return <div className="left-half">No problems available</div>;
  }
  const problem = problems[0]; 
  return (
    <div className="left-half">
      <div key={problem.id} className="problem-card">
        <h3>{problem.title}</h3>
        <p>{problem.description}</p>
        {problem.sample_input && (
          <p><strong>Input:</strong> {problem.sample_input}</p>
        )}
        {problem.sample_output && (
          <p><strong>Output:</strong> {problem.sample_output}</p>
        )}
      </div>
    </div>
  );
}

export default ProblemsPanel;
