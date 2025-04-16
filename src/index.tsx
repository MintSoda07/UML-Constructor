import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // react-router-dom 추가
import App from './App';
import IntroPage from './components/IntroPage';  // IntroPage 컴포넌트 임포트
import reportWebVitals from './reportWebVitals';
import LoginPage from './components/LoginPage';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<IntroPage />} /> {/* 소개 페이지 */}
        <Route path="/app" element={<App />} />   {/* UML Tool 페이지 */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
