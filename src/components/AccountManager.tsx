import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import { generateId, calculateEndingBalances } from "../utils/storage";
import { Account } from "../types";
import { Plus, Edit, Trash2, PiggyBank } from "lucide-react";
import MonthSelector from "./MonthSelector";

const AccountManager: React.FC = () => {
  const { state, dispatch, getCurrentMonth } = useAppContext();
  const currentMonth = getCurrentMonth();

  const [showForm, setShowForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0466c8");
  const [isSavings, setIsSavings] = useState(false);
  // Calculate current balances using proper calculation that includes transfers
  const calculateAccountBalance = (accountId: string): number => {
    if (!currentMonth) return 0;

    const endingBalances = calculateEndingBalances(currentMonth);
    const balance = endingBalances.find((b) => b.accountId === accountId);
    return balance ? balance.amount : 0;
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (editingAccountId) {
      // Update existing account
      const updatedAccount: Account = {
        id: editingAccountId,
        name,
        balance: 0, // This will be calculated based on transactions
        color,
        isSavings,
      };

      dispatch({ type: "UPDATE_ACCOUNT", payload: updatedAccount });
    } else {
      // Create new account
      const newAccount: Account = {
        id: generateId("account"),
        name,
        balance: 0,
        color,
        isSavings,
      };

      dispatch({ type: "ADD_ACCOUNT", payload: newAccount });
    }

    resetForm();
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccountId(account.id);
    setName(account.name);
    setColor(account.color);
    setIsSavings(account.isSavings || false);
    setShowForm(true);
  };

  const handleDeleteAccount = (id: string) => {
    // Check if account is used in current transactions
    if (!currentMonth) return;

    const isUsedInIncome = currentMonth.incomes.some((income) =>
      income.distributions.some((dist) => dist.accountId === id)
    );

    const isUsedInExpenses = currentMonth.expenses.some(
      (expense) => expense.accountId === id
    );

    if (isUsedInIncome || isUsedInExpenses) {
      alert(
        "Cannot delete account because it is used in transactions. Remove the transactions first."
      );
      return;
    }

    if (confirm("Are you sure you want to delete this account?")) {
      dispatch({ type: "DELETE_ACCOUNT", payload: id });
    }
  };

  const resetForm = () => {
    setName("");
    setColor("#0466c8");
    setIsSavings(false);
    setEditingAccountId(null);
    setShowForm(false);
  };

  if (!currentMonth) {
    return <div>No month data available</div>;
  }

  return (
    <div className="space-y-6">
      <MonthSelector />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" />
          Add Account
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingAccountId ? "Edit Account" : "Add New Account"}
          </h2>

          <form onSubmit={handleAddAccount}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Main Account, Bills, Savings, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 border-0 p-0 rounded-md"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="isSavings"
                  type="checkbox"
                  checked={isSavings}
                  onChange={(e) => setIsSavings(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isSavings"
                  className="ml-2 block text-sm text-gray-700"
                >
                  This is a savings account
                </label>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingAccountId ? "Update Account" : "Save Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.accounts.map((account) => {
          const balance = calculateAccountBalance(account.id);

          return (
            <div
              key={account.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 hover:shadow-md transition-shadow"
              style={{ borderColor: account.color }}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${account.color}20` }}
                    >
                      {account.isSavings ? (
                        <PiggyBank size={20} style={{ color: account.color }} />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: account.color }}
                        ></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {account.name}
                      </h3>
                      <p
                        className={`text-xl font-bold ${
                          balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(balance)}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditAccount(account)}
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {account.isSavings && (
                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Savings Account
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountManager;
