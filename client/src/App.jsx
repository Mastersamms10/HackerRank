import React from "react";
//import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginForm from "./LoginForm";
import ProblemsPage from "./ProblemsPage";
import AdminPanel from "./AdminPanel";
import "./styles/App.css"; 


function App() {
    return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/problems" element={<ProblemsPage />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}

export default App;
