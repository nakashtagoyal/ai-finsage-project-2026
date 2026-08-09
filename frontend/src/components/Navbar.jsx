import { Wallet, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from "react-router-dom";

export default function Navbar({ darkMode, setDarkMode }) {
  const { logout, user } = useAuth();
  return (
    <nav className="sticky top-0 z-40 bg-brand-gradient text-white px-4 md:px-8 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <Wallet size={22} />
        <span className="font-bold text-lg">FinSage AI</span>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="hover:text-yellow-300 transition"
        >
          Home
        </Link>
         <Link
          to="/budget"
          className="hover:text-yellow-300 transition"
        >
          Budget
        </Link>
        <Link
          to="/goals"
          className="hover:text-yellow-300 transition"
        >
          Goals
        </Link>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/10 rounded-full transition">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <span className="hidden sm:inline text-sm opacity-90">{user?.name}</span>
        <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
