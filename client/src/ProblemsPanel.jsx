import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/problems.css";

function ProblemsPanel({ problems, onSelectProblem }) {
  

   return (
    
    <div className="left-half">
      {problems.map((problem) => (
        <div
          key={problem.id}
          className="problem-card"
          onClick={() => onSelectProblem(problem)}
        >
          <h3>{problem.title}</h3>
          <p>{problem.description}</p>
          
          {problem.sample_input && (
            <p><strong>Input:</strong> {problem.sample_input}</p>
          )}

          {problem.sample_output && (
            <p><strong>Output:</strong> {problem.sample_output}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProblemsPanel;
