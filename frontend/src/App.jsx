import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';
// import Footer from './components/Footer.jsx';
import Contact from './pages/Contact.jsx';
import Feedback from './pages/Feedback.jsx';
import { useState } from 'react';
import Budget from './pages/Budget.jsx';
import Goals from './pages/Goals.jsx';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div className={darkMode ? "dark": ""}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={ <PrivateRoute> <Dashboard darkMode={darkMode} setDarkMode={setDarkMode}/> </PrivateRoute> } />
      <Route path="/contact" element= { <PrivateRoute> <Contact darkMode={darkMode} setDarkMode={setDarkMode} /> </PrivateRoute> } />
       <Route path="/feedback" element= { <PrivateRoute> <Feedback darkMode={darkMode} setDarkMode={setDarkMode} /> </PrivateRoute> } />
       <Route path="/budget" element={<PrivateRoute> <Budget darkMode={darkMode} setDarkMode={setDarkMode} /> </PrivateRoute>}/>
        <Route path="/goals" element={<PrivateRoute> <Goals darkMode={darkMode} setDarkMode={setDarkMode} /> </PrivateRoute>}/>
    </Routes>
    </div>
  );
}
