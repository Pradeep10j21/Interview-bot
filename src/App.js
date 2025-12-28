import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CompanySelection from './pages/CompanySelection';
import InterviewPage from './pages/InterviewPage';
import ResultPage from './pages/ResultPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CompanySelection />} />
          <Route path="/interview/:companyId" element={<InterviewPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

