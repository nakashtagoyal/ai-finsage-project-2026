import { useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Contact({ darkMode, setDarkMode }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    await api.post("/contact", form);

    alert("Your message has been sent.");

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-2xl mx-auto py-10 px-6 text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

        {/* Contact Information */}
        <div className="mb-8 p-5 rounded-xl bg-gray-100 dark:bg-indigo-900 shadow">
          <h2 className="text-xl font-semibold mb-3">Get in Touch</h2>

          <p className="mb-2">
            📞 <strong>Call Us:</strong>{" "}
            <a
              href="tel:+919876543210"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              +91 98765 43210
            </a>
          </p>

          <p className="mb-2">
            📧 <strong>Email:</strong>{" "}
            <a
              href="mailto:support@finsageai.com"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              support@finsageai.com
            </a>
          </p>

          <p>
            🕒 <strong>Support Hours:</strong> Monday – Friday, 9:00 AM – 6:00 PM
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input required
            className="w-full border rounded-lg p-3 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white border-gray-300 dark:border-indigo-700"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input required
            className="w-full border rounded-lg p-3 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white border-gray-300 dark:border-indigo-700"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input required
            className="w-full border rounded-lg p-3 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white border-gray-300 dark:border-indigo-700"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <textarea
          required
            rows="6"
            className="w-full border rounded-lg p-3 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white border-gray-300 dark:border-indigo-700"
            placeholder="Write your query..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 rounded-lg transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </Layout >
  );
}