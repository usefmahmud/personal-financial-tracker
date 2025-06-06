import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import { generateId } from "../utils/storage";
import { Goal, Expense } from "../types";
import { Plus, Target, Calendar, ShoppingCart, Trash2, Edit } from "lucide-react";
import MonthSelector from "./MonthSelector";

const GoalsManager: React.FC = () => {
  const { state, dispatch, getCurrentMonth } = useAppContext();
  const currentMonth = getCurrentMonth();

  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Calculate total savings from all savings accounts
  const calculateTotalSavings = (): number => {
    if (!currentMonth) return 0;

    const savingsAccounts = state.accounts.filter((acc) => acc.isSavings);
    let totalSavings = 0;

    savingsAccounts.forEach((account) => {
      // Get starting balance
      const startingBalance =
        currentMonth.startingBalances.find((sb) => sb.accountId === account.id)
          ?.amount || 0;

      // Add income distributions
      const incomeTotal = currentMonth.incomes.reduce((total, income) => {
        const distribution = income.distributions.find(
          (dist) => dist.accountId === account.id
        );
        return total + (distribution?.amount || 0);
      }, 0);

      // Subtract expenses
      const expensesTotal = currentMonth.expenses.reduce((total, expense) => {
        return expense.accountId === account.id ? total + expense.amount : total;
      }, 0);

      totalSavings += startingBalance + incomeTotal - expensesTotal;
    });

    return totalSavings;
  };

  const totalSavings = calculateTotalSavings();

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingGoalId) {
      // Update existing goal
      const updatedGoal: Goal = {
        id: editingGoalId,
        title,
        targetAmount: amount,
        dueDate,
        createdDate: new Date().toISOString(),
        isCompleted: false,
      };

      dispatch({ type: "UPDATE_GOAL", payload: updatedGoal });
    } else {
      // Create new goal
      const newGoal: Goal = {
        id: generateId("goal"),
        title,
        targetAmount: amount,
        dueDate,
        createdDate: new Date().toISOString(),
        isCompleted: false,
      };

      dispatch({ type: "ADD_GOAL", payload: newGoal });
    }

    resetForm();
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setDueDate(goal.dueDate);
    setShowForm(true);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      dispatch({ type: "DELETE_GOAL", payload: id });
    }
  };  const handleCompleteGoal = (goal: Goal) => {
    if (totalSavings < goal.targetAmount) {
      alert("You don't have enough savings to complete this goal yet!");
      return;
    }

    const savingsAccount = state.accounts.find((acc) => acc.isSavings);
    if (!savingsAccount) {
      alert("Please create a savings account first!");
      return;
    }

    if (confirm(`Are you sure you want to buy "${goal.title}" for ${formatCurrency(goal.targetAmount)}?`)) {
      // Check if "Goal" category exists, create it if not
      let goalCategory = state.categories.find((cat) => cat.name.toLowerCase() === "goal");
      let categoryId = goalCategory?.id;
      
      if (!goalCategory) {
        goalCategory = {
          id: generateId("category"),
          name: "Goal",
          color: "#9333ea", // Purple color for goals
        };
        categoryId = goalCategory.id;
      }

      // Create expense from savings account
      const expenseData: Expense = {
        id: generateId("expense"),
        amount: goal.targetAmount,
        description: `Goal completed: ${goal.title}`,
        date: new Date().toISOString(),
        categoryId: categoryId!,
        accountId: savingsAccount.id,
      };

      if (state.categories.some((cat) => cat.name.toLowerCase() === "goal")) {
        // Category exists, use regular completion
        dispatch({
          type: "COMPLETE_GOAL",
          payload: { goalId: goal.id, expenseData },
        });
      } else {
        // Category doesn't exist, create it along with completion
        dispatch({
          type: "COMPLETE_GOAL_WITH_CATEGORY",
          payload: { goalId: goal.id, expenseData, goalCategory },
        });
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setTargetAmount("");
    setDueDate("");
    setEditingGoalId(null);
    setShowForm(false);
  };

  const getProgressPercentage = (goal: Goal): number => {
    return Math.min((totalSavings / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const activeGoals = state.goals.filter((goal) => !goal.isCompleted);
  const completedGoals = state.goals.filter((goal) => goal.isCompleted);

  if (!currentMonth) {
    return <div>No month data available</div>;
  }

  return (
    <div className="space-y-6">
      <MonthSelector />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Goals</h1>
          <p className="text-sm text-gray-600">
            Total Savings: <span className="font-semibold text-green-600">{formatCurrency(totalSavings)}</span>
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={20} className="mr-2" />
          Add Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingGoalId ? "Edit Goal" : "Add New Goal"}
          </h2>

          <form onSubmit={handleAddGoal}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="New car, vacation, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="pl-8 w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                disabled={!title || !targetAmount || parseFloat(targetAmount) <= 0 || !dueDate}
              >
                {editingGoalId ? "Update Goal" : "Save Goal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Active Goals</h2>
        {activeGoals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Target size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No active goals yet. Create your first goal to start saving!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map((goal) => {
              const progress = getProgressPercentage(goal);
              const daysRemaining = getDaysRemaining(goal.dueDate);
              const isGoalReached = totalSavings >= goal.targetAmount;

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
                      <p className="text-sm text-gray-500">
                        Target: {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-1 text-gray-500 hover:text-purple-600 hover:bg-gray-100 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isGoalReached ? "bg-green-500" : "bg-purple-500"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{formatCurrency(totalSavings)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-1" />
                      {daysRemaining > 0 ? (
                        <span>{daysRemaining} days left</span>
                      ) : (
                        <span className="text-red-500">Overdue</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      Due: {new Date(goal.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  {isGoalReached && (
                    <button
                      onClick={() => handleCompleteGoal(goal)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Buy Now!
                    </button>
                  )}

                  {!isGoalReached && (
                    <div className="text-center text-sm text-gray-500">
                      Need {formatCurrency(goal.targetAmount - totalSavings)} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Completed Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500 opacity-75"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Target size={20} />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-green-500 w-full"></div>
                  </div>
                  <div className="text-center mt-2 text-sm text-green-600 font-medium">
                    Completed!
                  </div>
                </div>

                <div className="text-center text-xs text-gray-400">
                  Completed: {goal.completedDate && new Date(goal.completedDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsManager;
