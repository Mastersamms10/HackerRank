import React, { useState, useEffect } from "react";

function Timer({ duration = 1200, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const secsRemaining = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secsRemaining).padStart(2, "0")}`;
  };

  return (
    <div style={{ fontSize: "1.5rem", fontWeight: "bold",  marginRight: "20px" }}>
       TIME REMAINING: {formatTime(secondsLeft)}
    </div>
  );
}

export default Timer;
