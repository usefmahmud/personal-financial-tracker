import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import { generateId } from "../utils/storage";
import { Income } from "../types";
import { Plus, Trash2, DollarSign } from "lucide-react";
import MonthSelector from "./MonthSelector";

const IncomeManager: React.FC = () => {
  const { state, dispatch, getCurrentMonth } = useAppContext();
  const currentMonth = getCurrentMonth();

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [distributions, setDistributions] = useState<
    { accountId: string; amount: string }[]
  >(state.accounts.map((account) => ({ accountId: account.id, amount: "0" })));

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();

    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) return;

    // Validate that all distributions add up to the total amount
    const distributionValues = distributions.map(
      (d) => parseFloat(d.amount) || 0
    );
    const totalDistributed = distributionValues.reduce(
      (sum, val) => sum + val,
      0
    );

    if (Math.abs(totalAmount - totalDistributed) > 0.01) {
      alert("Distribution amounts must add up to the total income amount");
      return;
    }

    const newIncome: Income = {
      id: generateId("income"),
      amount: totalAmount,
      description,
      date: new Date().toISOString(),
      distributions: distributions.map((d) => ({
        accountId: d.accountId,
        amount: parseFloat(d.amount) || 0,
      })),
    };

    dispatch({ type: "ADD_INCOME", payload: newIncome });
    resetForm();
  };

  const handleDistributionChange = (accountId: string, value: string) => {
    setDistributions((prev) =>
      prev.map((d) => (d.accountId === accountId ? { ...d, amount: value } : d))
    );
  };

  const distributeEvenly = () => {
    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) return;

    const accountCount = state.accounts.length;
    const amountPerAccount = (totalAmount / accountCount).toFixed(2);

    setDistributions(
      state.accounts.map((account) => ({
        accountId: account.id,
        amount: amountPerAccount,
      }))
    );
  };

  const distributeRemaining = () => {
    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) return;

    const currentTotal = distributions.reduce(
      (sum, dist) => sum + (parseFloat(dist.amount) || 0),
      0
    );

    const remaining = totalAmount - currentTotal;
    if (remaining <= 0) return;

    // Find first non-zero distribution or default to first account
    const targetIndex =
      distributions.findIndex((d) => parseFloat(d.amount) === 0) || 0;

    setDistributions((prev) =>
      prev.map((d, i) =>
        i === targetIndex
          ? { ...d, amount: (parseFloat(d.amount) + remaining).toFixed(2) }
          : d
      )
    );
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDistributions(
      state.accounts.map((account) => ({ accountId: account.id, amount: "0" }))
    );
    setShowForm(false);
  };

  const handleDeleteIncome = (id: string) => {
    if (confirm("Are you sure you want to delete this income?")) {
      dispatch({ type: "DELETE_INCOME", payload: id });
    }
  };

  const totalDistributed = distributions.reduce(
    (sum, dist) => sum + (parseFloat(dist.amount) || 0),
    0
  );

  const distributionRemaining = parseFloat(amount) - totalDistributed;

  if (!currentMonth) {
    return <div>No month data available</div>;
  }

  return (
    <div className="space-y-6">
      <MonthSelector />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Income</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} className="mr-2" />
          Add Income
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Income
          </h2>

          <form onSubmit={handleAddIncome}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Salary, Freelance work, etc."
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Distribution
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={distributeEvenly}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                  >
                    Distribute Evenly
                  </button>
                  {distributionRemaining > 0 && (
                    <button
                      type="button"
                      onClick={distributeRemaining}
                      className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                    >
                      Distribute Remaining (
                      {formatCurrency(distributionRemaining)})
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                {state.accounts.map((account) => (
                  <div key={account.id} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: account.color }}
                    ></div>
                    <label className="text-sm font-medium text-gray-700 w-36">
                      {account.name}
                    </label>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          distributions.find((d) => d.accountId === account.id)
                            ?.amount || "0"
                        }
                        onChange={(e) =>
                          handleDistributionChange(account.id, e.target.value)
                        }
                        className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700">
                    Total Distributed:
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      Math.abs(parseFloat(amount) - totalDistributed) < 0.01
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(totalDistributed)}
                    {Math.abs(parseFloat(amount) - totalDistributed) >= 0.01 &&
                      ` (Difference: ${formatCurrency(
                        parseFloat(amount) - totalDistributed
                      )})`}
                  </div>
                </div>
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  Math.abs(parseFloat(amount) - totalDistributed) >= 0.01
                }
              >
                Save Income
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distribution
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentMonth.incomes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No income records yet
                </td>
              </tr>
            ) : (
              currentMonth.incomes.map((income) => (
                <tr key={income.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {income.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrency(income.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(income.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-2">
                      {income.distributions.map((dist) => {
                        const account = state.accounts.find(
                          (a) => a.id === dist.accountId
                        );
                        return account && dist.amount > 0 ? (
                          <span
                            key={account.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${account.color}30`,
                              color: account.color,
                            }}
                          >
                            {account.name}: {formatCurrency(dist.amount)}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteIncome(income.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeManager;
