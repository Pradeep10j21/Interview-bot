import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import './ResultPage.css';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (location.state && location.state.results) {
      setResults(location.state.results);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (results) {
      const duration = 2000;
      const steps = 60;
      const increment = results.overallScore / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= results.overallScore) {
          setAnimatedScore(results.overallScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [results]);

  if (!results) {
    return (
      <div className="result-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating your results...</p>
        </div>
      </div>
    );
  }

  const { overallScore, skillBreakdown, strengths, improvements, suggestions, answers } = results;
  const companyId = location.state?.companyId || 'google';

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  };

  const isSelected = overallScore >= 70;
  const totalQuestions = answers?.length || 0;
  const avgAnswerLength = answers?.reduce((sum, a) => sum + (a.answer?.length || 0), 0) / totalQuestions || 0;

  // Calculate additional metrics
  const totalWords = answers?.reduce((sum, a) => {
    return sum + (a.answer?.split(/\s+/).length || 0);
  }, 0) || 0;
  const avgWordsPerAnswer = Math.round(totalWords / totalQuestions) || 0;
  const avgConfidence = skillBreakdown.confidence;
  const avgCommunication = skillBreakdown.communication;
  const avgTechnical = skillBreakdown.technicalClarity;

  // Chart data for visualization
  const chartData = [
    { name: 'Communication', value: avgCommunication, color: '#4caf50' },
    { name: 'Confidence', value: avgConfidence, color: '#2196F3' },
    { name: 'Technical', value: avgTechnical, color: '#FF9800' }
  ];

  const CircularProgress = ({ score, size = 120, label }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="circular-progress-item">
        <div className="circular-progress" style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--green-light)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={getScoreColor(score)}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="progress-circle"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="round"
            />
          </svg>
          <div className="progress-text">
            <span className="progress-score">{score}%</span>
          </div>
        </div>
        <div className="progress-label">{label}</div>
      </div>
    );
  };

  const BarChart = ({ data }) => {
    return (
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div className="bar-label">{item.name}</div>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: item.color
                }}
              />
              <span className="bar-value">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="result-page">
      {/* Top Navigation Bar */}
      <div className="result-navbar">
        <div className="nav-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <h1 className="nav-title">Interview Results</h1>
        </div>
        <div className="nav-right">
          <button className="chatbot-toggle" onClick={() => setShowChatbot(!showChatbot)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C5.58 2 2 5.13 2 9c0 1.84.78 3.51 2.05 4.68L2 18l4.32-2.05C7.49 17.22 8.84 18 10 18c4.42 0 8-3.13 8-7s-3.58-7-8-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            AI Assistant
          </button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="result-dashboard">
        {/* Left Sidebar - Score Overview */}
        <div className="dashboard-sidebar">
          <div className="score-overview-card">
            <div className="score-header-main">
              <h2>Overall Score</h2>
              <span className="score-grade">{getScoreGrade(overallScore)}</span>
            </div>
            <div className="main-score-display">
              <div className="main-score-circle">
                <svg width="200" height="200">
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    stroke="var(--green-light)"
                    strokeWidth="15"
                    fill="none"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    stroke={getScoreColor(overallScore)}
                    strokeWidth="15"
                    fill="none"
                    strokeDasharray={534}
                    strokeDashoffset={534 - (overallScore / 100) * 534}
                    transform="rotate(-90 100 100)"
                    strokeLinecap="round"
                    className="main-progress-circle"
                    style={{ transition: 'stroke-dashoffset 2s ease-in-out' }}
                  />
                </svg>
                <div className="main-score-text">
                  <span className="main-score-value">{animatedScore}</span>
                  <span className="main-score-unit">/100</span>
                </div>
              </div>
            </div>
            <div className="score-status">
              <div className={`status-badge ${isSelected ? 'selected' : 'not-selected'}`}>
                {isSelected ? '✓ Selected' : 'Needs Improvement'}
              </div>
            </div>
          </div>

          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-value">{totalQuestions}</div>
                <div className="stat-label">Questions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <div className="stat-value">{avgWordsPerAnswer}</div>
                <div className="stat-label">Avg Words</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">{getScoreGrade(overallScore)}</div>
                <div className="stat-label">Grade</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-main">
          {/* Tabs */}
          <div className="dashboard-tabs">
            <button 
              className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
              onClick={() => setSelectedTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${selectedTab === 'skills' ? 'active' : ''}`}
              onClick={() => setSelectedTab('skills')}
            >
              Skills Breakdown
            </button>
            <button 
              className={`tab-btn ${selectedTab === 'questions' ? 'active' : ''}`}
              onClick={() => setSelectedTab('questions')}
            >
              Questions
            </button>
            <button 
              className={`tab-btn ${selectedTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setSelectedTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {selectedTab === 'overview' && (
              <div className="overview-grid">
                {/* Skill Breakdown Chart */}
                <div className="panel skill-chart-panel">
                  <div className="panel-header">
                    <h3>Skill Breakdown</h3>
                    <span className="panel-badge">Detailed Analysis</span>
                  </div>
                  <div className="skill-charts">
                    <CircularProgress score={skillBreakdown.communication} label="Communication" />
                    <CircularProgress score={skillBreakdown.confidence} label="Confidence" />
                    <CircularProgress score={skillBreakdown.technicalClarity} label="Technical" />
                  </div>
                  <BarChart data={chartData} />
                </div>

                {/* Strengths Panel */}
                <div className="panel strengths-panel">
                  <div className="panel-header">
                    <h3>✨ Strengths</h3>
                  </div>
                  <ul className="strengths-list">
                    {strengths.length > 0 ? (
                      strengths.map((strength, index) => (
                        <li key={index} className="strength-item">
                          <span className="check-icon">✓</span>
                          {strength}
                        </li>
                      ))
                    ) : (
                      <li className="no-items">No specific strengths identified</li>
                    )}
                  </ul>
                </div>

                {/* Improvements Panel */}
                <div className="panel improvements-panel">
                  <div className="panel-header">
                    <h3>📈 Areas for Improvement</h3>
                  </div>
                  <ul className="improvements-list">
                    {improvements.length > 0 ? (
                      improvements.map((improvement, index) => (
                        <li key={index} className="improvement-item">
                          <span className="arrow-icon">→</span>
                          {improvement}
                        </li>
                      ))
                    ) : (
                      <li className="no-items">Great job! Keep up the excellent work!</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {selectedTab === 'skills' && (
              <div className="skills-detail-panel">
                <div className="panel">
                  <div className="panel-header">
                    <h3>Detailed Skill Analysis</h3>
                  </div>
                  <div className="skills-detail-grid">
                    {chartData.map((skill, index) => (
                      <div key={index} className="skill-detail-card">
                        <div className="skill-detail-header">
                          <h4>{skill.name}</h4>
                          <span className="skill-percentage">{skill.value}%</span>
                        </div>
                        <div className="skill-progress-bar">
                          <div
                            className="skill-progress-fill"
                            style={{
                              width: `${skill.value}%`,
                              backgroundColor: skill.color
                            }}
                          />
                        </div>
                        <p className="skill-description">
                          {skill.name === 'Communication' && 'Your ability to articulate thoughts clearly and effectively.'}
                          {skill.name === 'Confidence' && 'Your level of self-assurance and presence during the interview.'}
                          {skill.name === 'Technical' && 'Your technical knowledge and clarity in explanations.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'questions' && (
              <div className="questions-panel">
                <div className="panel">
                  <div className="panel-header">
                    <h3>Question List</h3>
                    <span className="panel-info">All {totalQuestions} questions answered</span>
                  </div>
                  <div className="questions-list">
                    {answers && answers.map((answer, index) => (
                      <div key={index} className="question-item">
                        <div className="question-number-badge">{index + 1}</div>
                        <div className="question-content-item">
                          <div className="question-text-item">{answer.question}</div>
                          <div className="answer-preview">
                            {answer.answer.substring(0, 100)}...
                          </div>
                          <div className="question-score">
                            <span>Score: </span>
                            <span className="score-value">
                              {Math.round((answer.analysis?.communication + answer.analysis?.confidence + answer.analysis?.technicalClarity) / 3)}%
                            </span>
                          </div>
                        </div>
                        <div className="question-status">
                          <span className="status-dot completed"></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'analytics' && (
              <div className="analytics-panel">
                <div className="panel">
                  <div className="panel-header">
                    <h3>Performance Analytics</h3>
                  </div>
                  <div className="analytics-grid">
                    <div className="analytics-card">
                      <h4>Answer Length Analysis</h4>
                      <div className="analytics-value">{Math.round(avgAnswerLength)}</div>
                      <div className="analytics-label">Average characters per answer</div>
                      <div className="analytics-bar">
                        <div className="analytics-fill" style={{ width: `${Math.min(100, (avgAnswerLength / 200) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="analytics-card">
                      <h4>Total Words Spoken</h4>
                      <div className="analytics-value">{totalWords}</div>
                      <div className="analytics-label">Words across all answers</div>
                    </div>
                    <div className="analytics-card">
                      <h4>Performance Trend</h4>
                      <div className="trend-indicator">
                        {overallScore >= 70 ? '📈 Improving' : '📉 Needs Work'}
                      </div>
                      <div className="analytics-label">Overall performance level</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn shortlist-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16 2L6 12l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Shortlist
            </button>
            <button className="action-btn reject-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Reject
            </button>
            <button className="action-btn primary-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 7v11h14V7l-7-5z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              {isSelected ? 'Hire Candidate' : 'Review Later'}
            </button>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} results={results} />}
    </div>
  );
}

export default ResultPage;
