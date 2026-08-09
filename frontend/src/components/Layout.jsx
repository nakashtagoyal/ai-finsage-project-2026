import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children, darkMode, setDarkMode }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-indigo-950 text-gray-900 dark:text-white transition-colors">
        {children}
      </main>

      <Footer />
    </>
  );
}