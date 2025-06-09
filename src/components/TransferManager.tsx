import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import { generateId } from "../utils/storage";
import { Transfer } from "../types";
import { Plus, Trash2, DollarSign, Search, ArrowLeftRight } from "lucide-react";
import MonthSelector from "./MonthSelector";

const TransferManager: React.FC = () => {
  const { state, dispatch, getCurrentMonth } = useAppContext();
  const currentMonth = getCurrentMonth();

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fromAccountId, setFromAccountId] = useState(state.accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(state.accounts[1]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) return;
    
    if (fromAccountId === toAccountId) {
      alert("Please select different accounts for the transfer");
      return;
    }

    const newTransfer: Transfer = {
      id: generateId("transfer"),
      amount: transferAmount,
      description,
      date: new Date().toISOString(),
      fromAccountId,
      toAccountId,
    };

    dispatch({ type: "ADD_TRANSFER", payload: newTransfer });
    resetForm();
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setFromAccountId(state.accounts[0]?.id || "");
    setToAccountId(state.accounts[1]?.id || "");
    setShowForm(false);
  };

  const handleDeleteTransfer = (id: string) => {
    if (confirm("Are you sure you want to delete this transfer?")) {
      dispatch({ type: "DELETE_TRANSFER", payload: id });
    }
  };

  const filteredTransfers = currentMonth?.transfers?.filter((transfer) => {
    if (!searchTerm) return true;
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Find the accounts for this transfer
    const fromAccount = state.accounts.find(
      (acc) => acc.id === transfer.fromAccountId
    );
    const toAccount = state.accounts.find(
      (acc) => acc.id === transfer.toAccountId
    );

    return (
      transfer.description.toLowerCase().includes(lowerSearchTerm) ||
      fromAccount?.name.toLowerCase().includes(lowerSearchTerm) ||
      toAccount?.name.toLowerCase().includes(lowerSearchTerm)
    );
  }) || [];

  if (!currentMonth) {
    return <div>No month data available</div>;
  }

  return (
    <div className="space-y-6">
      <MonthSelector />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Transfers</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" />
          Add Transfer
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Transfer
          </h2>

          <form onSubmit={handleAddTransfer}>
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
                  placeholder="Emergency fund, Savings, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Account
                </label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {state.accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Account
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {state.accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
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
                disabled={!amount || parseFloat(amount) <= 0 || fromAccountId === toAccountId}
              >
                Save Transfer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search transfers..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No transfer records yet
                </td>
              </tr>
            ) : (
              filteredTransfers.map((transfer) => {
                const fromAccount = state.accounts.find(
                  (acc) => acc.id === transfer.fromAccountId
                );
                const toAccount = state.accounts.find(
                  (acc) => acc.id === transfer.toAccountId
                );

                return (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transfer.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${fromAccount?.color}30`,
                          color: fromAccount?.color,
                        }}
                      >
                        {fromAccount?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <ArrowLeftRight size={14} className="text-gray-400 mr-2" />
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${toAccount?.color}30`,
                            color: toAccount?.color,
                          }}
                        >
                          {toAccount?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                      {formatCurrency(transfer.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transfer.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteTransfer(transfer.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferManager;
