import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import SearchInterface from './components/SearchInterface';
import Dashboard from './components/Dashboard';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const MainContent = styled.main`
  padding-top: 80px; /* Account for fixed header */
  min-height: calc(100vh - 80px);
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/search" element={<SearchInterface />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;
