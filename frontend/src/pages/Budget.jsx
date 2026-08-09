import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import Footer from "../components/Footer";

export default function Budget({ darkMode, setDarkMode }) {
    const [budgets, setBudgets] = useState([]);
    const [form, setForm] = useState({
        category: '', limit: '', month: new Date().toISOString().slice(0, 7),
    });

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [showBudgets, setShowBudgets] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const loadBudgets = async () => {
        try {
            const { data } = await api.get("/budgets");
            setBudgets(data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSuggestBudget = async () => {
        try {
            const { data } = await api.post("/budgets/suggest");

            setSuggestions(data);
            setShowSuggestions(true);
            setShowBudgets(false);
        } catch (err) {
            console.log(err.response?.data || err);
        }
    };

    const handleCreateBudget = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await api.put(`/budgets/${editingId}`, {
                    category: form.category,
                    limit: Number(form.limit),
                    month: form.month,
                });

            } else {
                await api.post('/budgets', {
                    category: form.category,
                    limit: Number(form.limit),
                    month: form.month,
                });
            }

            setEditingId(null);
            setForm({
                category: '',
                limit: '',
                month: new Date().toISOString().slice(0, 7),
            });

            loadBudgets();
        } catch (err) {
            console.log(err);
        }
    };

    const handleDeleteBudget = async (id) => {
        if (!window.confirm("Delete this budget?")) return;

        try {
            await api.delete(`/budgets/${id}`);
            loadBudgets();
        } catch (err) {
            console.log(err);
        }
    };

    const handleEditBudget = (budget) => {
        setEditingId(budget._id);
        setForm({
            category: budget.category,
            limit: budget.limit,
            month: budget.month,
        });
    };

    useEffect(() => {
        loadBudgets();
    }, []);
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-indigo-950">
            <Navbar
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />

            <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
                <h1 className="text-3xl font-bold text-indigo-600 dark:text-cyan-400 mb-6">
                    Budget Management
                </h1>

                <form
                    onSubmit={handleCreateBudget}
                    className="bg-white dark:bg-indigo-900 rounded-2xl shadow-md p-6 mb-6"
                >
                    <div className="grid md:grid-cols-3 gap-4">

                        <input
                            type="text"
                            placeholder="Category (Food, Transport...)"
                            className="border rounded-lg px-4 py-2"
                            value={form.category}
                            onChange={(e) =>
                                setForm({ ...form, category: e.target.value })
                            }
                            required
                        />

                        <input
                            type="number"
                            placeholder="Budget Limit"
                            className="border rounded-lg px-4 py-2"
                            value={form.limit}
                            onChange={(e) =>
                                setForm({ ...form, limit: e.target.value })
                            }
                            required
                        />

                        <input
                            type="month"
                            className="border rounded-lg px-4 py-2"
                            value={form.month}
                            onChange={(e) =>
                                setForm({ ...form, month: e.target.value })
                            }
                        />

                        <button
                            type="submit"
                            className="mt-4 bg-indigo-500 hover:bg-indigo-800 text-white rounded-lg px-4 py-2 font-semibold"
                        >
                            {editingId ? "Update Budget" : "Create Budget"}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleSuggestBudget}
                        className="mt-7 bg-green-500 hover:bg-green-800 text-white rounded-lg px-4 py-2 font-semibold"
                    >
                        🤖 AI Suggest
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setShowBudgets(!showBudgets);
                            setShowSuggestions(false);
                        }}
                        className="bg-blue-500 hover:bg-blue-800 text-white rounded-lg px-4 py-2 font-semibold ml-3 ml-6"
                    >
                        {showBudgets ? "Hide Budgets" : "Show Budgets"}
                    </button>

                </form>

                {showBudgets &&
                    (
                        <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-md p-6">
                            {budgets.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-300">
                                    No budgets found.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {budgets.map((budget) => (
                                        <div
                                            key={budget._id}
                                            className="border rounded-xl p-4 dark:border-indigo-700"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="font-semibold text-lg dark:text-white">
                                                        {budget.category}
                                                    </h2>

                                                    <p className="text-gray-600 dark:text-gray-300">
                                                        Limit: ₹{budget.limit}
                                                    </p>

                                                    <p className="text-gray-600 dark:text-gray-300">
                                                        Month: {budget.month}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditBudget(budget)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
                                                    >
                                                        ✏ Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteBudget(budget._id)}
                                                        className="bg-red-500 hover:bg-red-800 text-white px-3 py-1 rounded-lg"
                                                    >
                                                        🗑 Delete
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-500 ${(budget.spent || 0) / budget.limit <= 0.4
                                                            ? "bg-green-500"
                                                            : (budget.spent || 0) / budget.limit <= 0.6
                                                                ? "bg-yellow-400"
                                                                : (budget.spent || 0) / budget.limit <= 0.9
                                                                    ? "bg-orange-500"
                                                                    : "bg-red-600"
                                                            }`}
                                                        style={{
                                                            width: `${Math.min(((budget.spent || 0) / budget.limit) * 100, 100)}%`,
                                                        }}
                                                    />
                                                </div>

                                                <p className="text-sm mt-2 text-black dark:text-white">
                                                    Spent: ₹{budget.spent || 0} / ₹{budget.limit}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                {showSuggestions && (
                    <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-md p-6 mt-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">
                            🤖 AI Budget Suggestions
                        </h2>

                        {suggestions.length === 0 ? (
                            <p>No suggestions found.</p>
                        ) : (
                            <div className="space-y-4">
                                {suggestions.map((budget, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-xl p-4 dark:border-indigo-700"
                                    >
                                        <h3 className="font-semibold text-lg dark:text-white">
                                            {budget.category}
                                        </h3>

                                        <p className="text-gray-600 dark:text-gray-300">
                                            Suggested Limit: ₹{budget.limit}
                                        </p>

                                        <p className="text-gray-600 dark:text-gray-300">
                                            Month: {budget.month}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}