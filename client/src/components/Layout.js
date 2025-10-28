import React, { useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import VoiceAssistant from './VoiceAssistant';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>💰 PocketPilot</h1>
            <p>Your Smart Financial Copilot</p>
          </div>
          <div className="nav-links">
            <Link to="/" className={isActive('/') ? 'active' : ''}>Dashboard</Link>
            <Link to="/expenses" className={isActive('/expenses') ? 'active' : ''}>Expenses</Link>
            <Link to="/goals" className={isActive('/goals') ? 'active' : ''}>Goals</Link>
            <Link to="/analytics" className={isActive('/analytics') ? 'active' : ''}>Analytics</Link>
          </div>
          <div className="nav-user">
            <span>Welcome, {user?.name}!</span>
            <button className="btn btn-secondary" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <VoiceAssistant />
    </div>
  );
};

export default Layout;
