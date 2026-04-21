import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Login from './pages/Login';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { db } from './firebase';
import { LogOut, Sun, Moon } from 'lucide-react';

function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  useEffect(() => {
    // Check for latest reading to determine connectivity
    const readingsRef = query(ref(db, 'greenhouse/readings'), limitToLast(1));
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const keys = Object.keys(data);
        if (keys.length > 0) {
          setLastHeartbeat(Date.now());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - lastHeartbeat;
      setIsOnline(lastHeartbeat > 0 && diff < 90000);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastHeartbeat]);

  return (
    <BrowserRouter>
      <div className={isAuthenticated ? "min-h-screen p-4 md:p-8 pb-20" : "min-h-screen overflow-hidden"}>
        <div className={isAuthenticated ? "max-w-7xl mx-auto space-y-6" : "w-full h-full"}>
          {isAuthenticated && (
            <header className="flex items-center justify-between mb-8 animate-fade-in-down">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" /><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.2.4-4.8-.4-1.2-.6-2.1-1.9-2.6-3.3C4.3 6.3 7.4 8 9.5 9.4z" /><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1.7-1.3 2.9-1.3 3 1.2.1 1.2-.6 2.5-1.6 3.5-1.7 1.7-5.1 3.3-8.1 3.3" /></svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Smart Mushroom Greenhouse
                  </h1>
                  <p className="text-slate-400">Real-time Monitoring & Control System</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block mr-2">
                  <div className="text-sm text-slate-400">System Status</div>
                  <div className={`flex items-center gap-2 font-medium justify-end ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className="p-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 rounded-xl transition-all border border-white/5"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button
                  onClick={handleLogout}
                  className="p-3 bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-white/5 hover:border-red-500/20"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </header>
          )}

          <Routes>
            <Route
              path="/login"
              element={!isAuthenticated ? <Login onLogin={setIsAuthenticated} /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/history"
              element={isAuthenticated ? <History /> : <Navigate to="/login" />}
            />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
