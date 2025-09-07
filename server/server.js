const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "sms",
  password: "*sAmith10",
  database: "codesprint",
   multipleStatements: true
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin") {
    res.status(200).json({ message: "Admin authenticated" });
  } else {
    res.status(401).json({ error: "Invalid admin credentials" });
  }
});

app.post("/submit", (req, res) => {
  const { team_id, team_name, problem_id, language, code , Output , status} = req.body;

  if (!team_id || !team_name || !problem_id || !language || !code ) {
    return res.status(400).json({ error: "Missing submission data" });
  }

  const query = `
    INSERT INTO submissions (team_id, team_name, problem_id, language, code, Output, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [team_id, team_name, problem_id, language, code, Output, status], (err) => {
    if (err) {
      console.error("Submission error:", err);
      return res.status(500).json({ error: "Failed to submit" });
    }

    res.status(201).json({ message: "Submission successful" });
  });
});
app.get("/problems", (req, res) => {
  const { team_id } = req.query;

  if (!team_id) {
    return res.status(400).json({ error: "Missing team_id" });
  }

  const checkQuery = `
    SELECT p.* FROM assigned_problems ap
JOIN problems p ON ap.problem_id = p.id
WHERE ap.team_id = ?
  `;

  db.query(checkQuery, [team_id], (err, results) => {
    if (err) {
      console.error("Error checking assigned problems:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length > 0) {
      // Already assigned — return them
      return res.status(200).json(results);
    }

    // Not assigned yet — pick one per category
    const assignQuery = `
      SELECT * FROM problems WHERE category = 'Write' ORDER BY RAND() LIMIT 1;
      SELECT * FROM problems WHERE category = 'debug' ORDER BY RAND() LIMIT 1;
    `;

    db.query(assignQuery, [], (err, [writeRes, debugRes]) => {
      if (err) {
        console.error("Error selecting problems:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      const selected = [writeRes[0], debugRes[0]];

      // Insert into assigned_problems
      const insertValues = selected.map(p => [team_id, p.id]);
      const insertQuery = "INSERT INTO assigned_problems (team_id, problem_id) VALUES ?";

      db.query(insertQuery, [insertValues], (err) => {
        if (err) {
          console.error("Error assigning problems:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.status(200).json(selected);
      });
    });
  });
});
app.post("/login", (req, res) => {
  const { team_id, team_name } = req.body;

  if (!team_id || !team_name) {
    return res.status(400).json({ error: "Missing team_id or team_name" });
  }

  const query = "SELECT * FROM teams WHERE team_id = ? AND team_name = ?";
  db.query(query, [team_id, team_name], (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length > 0) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ error: "Invalid team credentials" });
    }
  });
});
app.post("/register", (req, res) => {
  const { team_id, team_name } = req.body;

  if (!team_id || !team_name) {
    return res.status(400).json({ error: "Missing team_id or team_name" });
  }

  const checkQuery = "SELECT * FROM teams WHERE team_id = ?";
  db.query(checkQuery, [team_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Query error" });

    if (results.length > 0) {
      return res.status(409).json({ error: "Team ID already exists" });
    }

    const insertQuery = "INSERT INTO teams (team_id, team_name) VALUES (?, ?)";
    db.query(insertQuery, [team_id, team_name], (err) => {
      if (err) return res.status(500).json({ error: "Insert error" });
      res.status(201).json({ message: "Team registered" });
    });
  });
});

app.get("/admin/submissions", (req, res) => {
  
  const query = `
   SELECT s.id, s.team_id, s.team_name, s.problem_id,
           p.title AS problem_title,
           s.language, s.code, s.output, s.status, s.submitted_at
    FROM codesprint.submissions s
    JOIN codesprint.problems p ON s.problem_id = p.id
    ORDER BY s.submitted_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching submissions:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(200).json(results);
  });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
