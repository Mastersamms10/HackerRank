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
        <h3>INPUT FORMAT</h3>
        <p>{problem.input_format}</p>
        OUTPUT FORMAT
        <p>{problem.output_format}</p>
        CONSTRAINTS
        <p>{problem.constraints}</p>
        {problem.sample_input && (
          <strong><h3>Input:</h3>
          <p> {problem.sample_input}</p></strong>
        )}
        {problem.sample_output && (
          <strong><h3>Output: </h3><p> {problem.sample_output}</p></strong>
        )}
      </div>
    </div>
  );
}

export default ProblemsPanel;
