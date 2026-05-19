import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Smart Expense Tracker</h1>
          <p>Track expenses with AI-powered insights</p>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/" element={<div>Home Page - Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
