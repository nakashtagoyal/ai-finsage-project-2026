import axios from "axios";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Goals({ darkMode, setDarkMode }) {
    const [showForm, setShowForm] = useState(false);
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [savedAmount, setSavedAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [savingAmount, setSavingAmount] = useState("");
    const [completedGoal, setCompletedGoal] = useState(null);
    const [showCompletedGoals, setShowCompletedGoals] = useState(false);
    const [completedGoals, setCompletedGoals] = useState([]);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [purchaseGoal, setPurchaseGoal] = useState(null);
    const [balance, setBalance] = useState(0);

    const token = localStorage.getItem("finsage_token");

    const fetchGoals = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/goals", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const summary = await axios.get(
                "http://localhost:5000/api/transactions/summary",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setBalance(summary.data.balance);

            setGoals(res.data.filter(goal => !goal.completed));
            setCompletedGoals(res.data.filter(goal => goal.completed));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchGoals();
        }
    }, [token]);

    const saveGoal = async () => {
        if (Number(savedAmount) > balance) {
            alert(`Current Saved cannot be greater than your available balance (₹${balance.toFixed(2)})`);
            return;
        }

        try {
            if (editingId) {
                await axios.put(
                    `http://localhost:5000/api/goals/${editingId}`,
                    {
                        title,
                        targetAmount,
                        savedAmount,
                        targetDate,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setEditingId(null);
            } else {
                await axios.post(
                    "http://localhost:5000/api/goals",
                    {
                        title,
                        targetAmount,
                        savedAmount,
                        targetDate,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            setTitle("");
            setTargetAmount("");
            setSavedAmount("");
            setTargetDate("");

            setShowForm(false);
            fetchGoals();
        } catch (err) {
            console.error(err);
        }
    };

    const editGoal = (goal) => {
        setTitle(goal.title);
        setTargetAmount(goal.targetAmount);
        setSavedAmount(goal.savedAmount);
        setTargetDate(goal.targetDate?.split("T")[0] || "");
        setEditingId(goal._id);
        setShowForm(true);
    };

    const deleteGoal = async (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;

        try {
            await axios.delete(
                `http://localhost:5000/api/goals/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchGoals();
            window.dispatchEvent(new Event("goalUpdated"));
            window.dispatchEvent(new Event("transactionUpdate"));

        } catch (err) {
            console.error(err);
            alert("Failed to delete goal.");
        }
    };

    const addSavings = async () => {
        if (!savingAmount || Number(savingAmount) <= 0) return;

        const totalSaved =
            Number(selectedGoal.savedAmount) + Number(savingAmount);

        const remainingAmount =
            Number(selectedGoal.targetAmount) - Number(selectedGoal.savedAmount);

        if (Number(savingAmount) > remainingAmount) {
            alert(
                `You are adding ₹${Number(savingAmount) - remainingAmount} extra.\n\nYou only need ₹${remainingAmount} to complete this goal.`
            );
            return;
        }

        if (totalSaved > balance) {
            alert(`Current Saved cannot exceed your available balance (₹${balance.toFixed(2)}).`);
            return;
        }


        const updatedGoal = await axios.put(
            `http://localhost:5000/api/goals/${selectedGoal._id}`,
            {
                savedAmount: totalSaved,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setShowSavingsModal(false);

        if (updatedGoal.data.completed) {
            setCompletedGoal(updatedGoal.data);
        }

        setSelectedGoal(null);
        setSavingAmount("");

        fetchGoals();
        window.dispatchEvent(new Event("goalUpdated"));
        window.dispatchEvent(new Event("transactionUpdate"));


    };

    const purchaseGoalHandler = async () => {
        try {
            await axios.put(
                `http://localhost:5000/api/goals/${purchaseGoal._id}/purchase`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setShowPurchaseModal(false);
            setPurchaseGoal(null);

            fetchGoals();
            window.dispatchEvent(new Event("goalUpdated"));
            window.dispatchEvent(new Event("transactionUpdate"));


        } catch (err) {
            console.error(err);
            alert("Purchase failed.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-indigo-950 flex flex-col">
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-cyan-400">
                        Financial Goals
                    </h1>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCompletedGoals(!showCompletedGoals)}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold"
                        >
                            ✅ Completed Goals
                        </button>

                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold"
                        >
                            + Add Goal
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-md p-6 mb-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Goal Name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border rounded-lg p-3"
                            />

                            <input
                                type="number"
                                placeholder="Target Amount"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                className="border rounded-lg p-3"
                            />

                            <input
                                type="number"
                                placeholder={"Current Saved (Max ₹" + balance.toFixed(2) + ")"}
                                max={balance}
                                value={savedAmount}
                                onChange={(e) => setSavedAmount(e.target.value)}
                                className="border rounded-lg p-3"
                            />

                            <input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="border rounded-lg p-3"
                            />
                        </div>

                        <button
                            onClick={saveGoal}
                            className="mt-5 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl"
                        >
                            {editingId ? "Update Goal" : "Save Goal"}
                        </button>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.length === 0 ? (
                        <div className="bg-white dark:bg-indigo-900 rounded-2xl p-8 shadow-md text-center col-span-full">
                            <p className="text-gray-500 dark:text-gray-300">
                                No goals added yet.
                            </p>
                        </div>
                    ) : (
                        goals.map((goal) => {
                            const progress =
                                goal.targetAmount > 0
                                    ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
                                    : 0;

                            return (
                                <div
                                    key={goal._id}
                                    className="relative bg-white dark:bg-indigo-900 rounded-2xl shadow-md p-6"
                                >

                                    <div className="flex justify-between items-start mb-3">
                                        <h2 className="text-xl font-bold text-black dark:text-white">
                                            {goal.title}
                                        </h2>

                                        <button
                                            onClick={() =>
                                                setMenuOpen(menuOpen === goal._id ? null : goal._id)
                                            }
                                            className="text-2xl text-gray-500 hover:text-indigo-500"
                                        >
                                            ⋮
                                        </button>
                                    </div>

                                    {menuOpen === goal._id && (
                                        <div className="absolute right-5 top-14 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 w-40 z-50">
                                            <button
                                                onClick={() => {
                                                    editGoal(goal);
                                                    setMenuOpen(null);
                                                }}
                                                className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                                            >
                                                ✏ Edit Goal
                                            </button>

                                            <button
                                                onClick={() => {
                                                    deleteGoal(goal._id);
                                                    setMenuOpen(null);
                                                }}
                                                className="block w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                                            >
                                                🗑 Delete Goal
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedGoal(goal);
                                                    setSavingAmount("");
                                                    setShowSavingsModal(true);
                                                    setMenuOpen(null);
                                                }}
                                                className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                                            >
                                                💰 Add Savings
                                            </button>
                                        </div>
                                    )}

                                    <p className="text-gray-700 dark:text-gray-200">
                                        ₹{goal.savedAmount} / ₹{goal.targetAmount}
                                    </p>

                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-4">
                                        <div
                                            className="bg-green-500 h-3 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                                        {progress.toFixed(0)}% Completed
                                    </p>

                                    <p className="text-sm mt-2 text-gray-700 dark:text-gray-200">
                                        Target Date:{" "}
                                        {goal.targetDate
                                            ? new Date(goal.targetDate).toLocaleDateString()
                                            : "Not set"}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>

                {showCompletedGoals && (
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-green-600 mb-5">
                            ✅ Completed Goals
                        </h2>

                        {completedGoals.length === 0 ? (
                            <p className="text-gray-500">No completed goals.</p>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {completedGoals.map((goal) => (
                                    <div
                                        key={goal._id}
                                        onClick={() => {
                                            if (!goal.purchased) {
                                                setPurchaseGoal(goal);
                                                setShowPurchaseModal(true);
                                            }
                                        }}
                                        className="relative bg-green-100 dark:bg-green-900 rounded-2xl p-6 shadow cursor-pointer hover:scale-105 transition text-black dark:text-white"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevents opening purchase modal
                                                deleteGoal(goal._id);
                                            }}
                                            className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-xl"
                                        >
                                            🗑
                                        </button>

                                        <h3 className="text-xl font-bold">
                                            {goal.title}
                                        </h3>

                                        <p className="mt-2">
                                            Purchase Amount: ₹{goal.targetAmount}
                                        </p>

                                        <p className="text-green-600 dark:text-green-300 font-semibold mt-2">
                                            {goal.purchased ? "✔ Purchased" : "🛒 Click to Purchase"}
                                        </p>

                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                            Purchase Date:{" "}
                                            {goal.purchasedAt
                                                ? new Date(goal.purchasedAt).toLocaleDateString()
                                                : "Not Purchased"}
                                        </p>
                                    </div>
                                ))}

                            </div>
                        )}
                    </div>
                )}

            </main>
            {showSavingsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-indigo-900 rounded-2xl p-6 w-96 shadow-xl">
                        <h2 className="text-2xl font-bold mb-5 text-black dark:text-white">
                            Add Savings
                        </h2>

                        <input
                            type="number"
                            max={balance}
                            placeholder={`Available Balance: ₹${balance.toFixed(2)}`}
                            value={savingAmount}
                            onChange={(e) => setSavingAmount(e.target.value)}
                            className="w-full border rounded-lg p-3 mb-5 dark:bg-indigo-800 dark:text-white"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Available Balance: ₹{balance.toFixed(2)}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowSavingsModal(false)}
                                className="px-5 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={addSavings}
                                className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                            >
                                Add Savings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {completedGoal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-indigo-900 rounded-2xl p-8 text-center shadow-2xl w-96">
                        <h2 className="text-3xl font-bold text-green-600 mb-3">
                            🎉 Goal Completed!
                        </h2>

                        <p className="text-lg text-gray-700 dark:text-gray-200">
                            Congratulations!
                        </p>

                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            <strong>{completedGoal.title}</strong> has been completed successfully.
                        </p>

                        <button
                            onClick={() => setCompletedGoal(null)}
                            className="mt-6 px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Awesome!
                        </button>
                    </div>
                </div>
            )}

            {showPurchaseModal && purchaseGoal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-indigo-900 rounded-2xl p-6 w-96 shadow-xl">
                        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
                            Purchase Goal
                        </h2>

                        <p className="text-gray-700 dark:text-gray-300">
                            Do you want to purchase?
                        </p>

                        <p className="font-bold text-lg mt-2 text-black dark:text-white">
                            {purchaseGoal.title}
                        </p>

                        <p className="mt-2 text-black dark:text-white">
                            Amount: ₹{purchaseGoal.targetAmount}
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowPurchaseModal(false);
                                    setPurchaseGoal(null);
                                }}
                                className="px-5 py-2 rounded-lg bg-gray-500 text-white"
                            >
                                No
                            </button>

                            <button
                                onClick={purchaseGoalHandler}
                                className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                            >
                                Yes, Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}