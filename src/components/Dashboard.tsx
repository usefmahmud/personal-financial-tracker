import React from "react";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import {
  getTotalMonthlyIncome,
  getTotalMonthlyExpenses,
  calculateEndingBalances,
} from "../utils/storage";
import MonthSelector from "./MonthSelector";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Wallet,
  PiggyBank,
} from "lucide-react";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { state, getCurrentMonth } = useAppContext();
  const currentMonth = getCurrentMonth();

  if (!currentMonth) {
    return <div>No month data available</div>;
  }
  const totalIncome = getTotalMonthlyIncome(currentMonth);
  const totalExpenses = getTotalMonthlyExpenses(currentMonth);
  const totalRemaining = totalIncome - totalExpenses;

  // Calculate account balances using the proper calculation that includes transfers
  const endingBalances = calculateEndingBalances(currentMonth);
  const accountBalances = new Map<string, number>();

  endingBalances.forEach(({ accountId, amount }) => {
    accountBalances.set(accountId, amount);
  });

  // Calculate savings and balance (complementary)
  const savingsAccount = state.accounts.find((acc) => acc.isSavings);
  const savingsBalance = savingsAccount
    ? accountBalances.get(savingsAccount.id) || 0
    : 0;

  // Balance is the remaining money excluding savings
  const balance = totalRemaining - savingsBalance;

  // Prepare data for charts
  const accountData = {
    labels: state.accounts.map((account) => account.name),
    datasets: [
      {
        data: state.accounts.map(
          (account) => accountBalances.get(account.id) || 0
        ),
        backgroundColor: state.accounts.map((account) => account.color),
        borderWidth: 1,
      },
    ],
  };

  // Expense by category data
  const expensesByCategory = new Map<string, number>();
  currentMonth.expenses.forEach((expense) => {
    const current = expensesByCategory.get(expense.categoryId) || 0;
    expensesByCategory.set(expense.categoryId, current + expense.amount);
  });

  const categoryData = {
    labels: state.categories.map((category) => category.name),
    datasets: [
      {
        data: state.categories.map(
          (category) => expensesByCategory.get(category.id) || 0
        ),
        backgroundColor: state.categories.map((category) => category.color),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <MonthSelector />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Income</p>
              <p className="text-2xl font-semibold text-gray-800">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <ArrowUpRight className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-2xl font-semibold text-gray-800">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ArrowDownRight className="text-red-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p
                className={`text-2xl font-semibold ${
                  balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(balance)}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-full ${
                balance >= 0 ? "bg-green-100" : "bg-red-100"
              } flex items-center justify-center`}
            >
              <Wallet
                className={balance >= 0 ? "text-green-600" : "text-red-600"}
                size={20}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Savings</p>
              <p className="text-2xl font-semibold text-purple-600">
                {formatCurrency(savingsBalance)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <PiggyBank className="text-purple-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <PieChart size={20} className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Account Balances
            </h3>
          </div>
          <div className="h-64">
            <Doughnut data={accountData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <PieChart size={20} className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Expenses by Category
            </h3>
          </div>
          <div className="h-64">
            <Doughnut data={categoryData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-3 font-medium text-gray-500">
                  Description
                </th>
                <th className="text-left pb-3 font-medium text-gray-500">
                  Category
                </th>
                <th className="text-left pb-3 font-medium text-gray-500">
                  Account
                </th>
                <th className="text-left pb-3 font-medium text-gray-500">
                  Amount
                </th>
                <th className="text-left pb-3 font-medium text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {currentMonth.expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                currentMonth.expenses.slice(0, 5).map((expense) => {
                  const category = state.categories.find(
                    (cat) => cat.id === expense.categoryId
                  );
                  const account = state.accounts.find(
                    (acc) => acc.id === expense.accountId
                  );

                  return (
                    <tr
                      key={expense.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3">{expense.description}</td>
                      <td className="py-3">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: category?.color }}
                        ></span>
                        {category?.name || "Unknown"}
                      </td>
                      <td className="py-3">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: account?.color }}
                        ></span>
                        {account?.name || "Unknown"}
                      </td>
                      <td className="py-3 text-red-600">
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
