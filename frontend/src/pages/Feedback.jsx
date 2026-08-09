import { useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

export default function Feedback({darkMode, setDarkMode}) {

  const [form, setForm] = useState({
    name: "",
    rating: 5,
    email: "",
    review: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    await api.post("/feedback", form);

    alert("Thank you for your feedback!");

    setForm({
      name: "",
      rating: 5,
      review: "",
    });
  };

  return (
    <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-2xl mx-auto py-10 px-6 text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-6">
          Feedback
        </h1>

        <form onSubmit={submit} className="space-y-4">

          <input required
           className="w-full border rounded-lg p-3 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white border-gray-300 dark:border-indigo-700"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <select required
            className="w-full border rounded-lg p-3 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white border-gray-300 dark:border-indigo-700"
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: Number(e.target.value) })
            }
          >
            <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
            <option value={4}>⭐⭐⭐⭐ Very Good</option>
            <option value={3}>⭐⭐⭐ Good</option>
            <option value={2}>⭐⭐ Fair</option>
            <option value={1}>⭐ Poor</option>
          </select>

          <input required
            className="w-full border rounded-lg p-3 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white border-gray-300 dark:border-indigo-700"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <textarea required
            rows="6"
           className="w-full border rounded-lg p-3 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white border-gray-300 dark:border-indigo-700"
            placeholder="Write your feedback..."
            value={form.review}
            onChange={(e) =>
              setForm({ ...form, review: e.target.value })
            }
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 rounded-lg transition"
          >
            Submit Feedback
          </button>

        </form>
      </div>
    </Layout>
  );
}