import { AppState, Month, Account, Category } from "../types";
import { format } from "date-fns";

const STORAGE_KEY = "finance_tracker_data";

// Default categories
const defaultCategories: Category[] = [];

// Default accounts
const defaultAccounts: Account[] = [];

// Generate a new month based on previous month if available
const createNewMonth = (previousMonth?: Month): Month => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  // If there's a previous month, create the next month in sequence
  if (previousMonth) {
    month = previousMonth.month + 1;
    year = previousMonth.year;

    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  const monthName = format(new Date(year, month, 1), "MMMM yyyy");
  const id = `month_${year}_${month}`;

  const startingBalances = previousMonth
    ? calculateEndingBalances(previousMonth).map(({ accountId, amount }) => ({
        accountId,
        amount,
      }))
    : defaultAccounts.map((account) => ({
        accountId: account.id,
        amount: 0,
      }));

  return {
    id,
    name: monthName,
    year,
    month,
    incomes: [],
    expenses: [],
    startingBalances,
  };
};

// Calculate ending balances for a month
const calculateEndingBalances = (
  month: Month
): { accountId: string; amount: number }[] => {
  const balances = new Map<string, number>();

  // Initialize with starting balances
  month.startingBalances.forEach(({ accountId, amount }) => {
    balances.set(accountId, amount);
  });

  // Add incomes
  month.incomes.forEach((income) => {
    income.distributions.forEach((distribution) => {
      const currentBalance = balances.get(distribution.accountId) || 0;
      balances.set(
        distribution.accountId,
        currentBalance + distribution.amount
      );
    });
  });

  // Subtract expenses
  month.expenses.forEach((expense) => {
    const currentBalance = balances.get(expense.accountId) || 0;
    balances.set(expense.accountId, currentBalance - expense.amount);
  });

  return Array.from(balances.entries()).map(([accountId, amount]) => ({
    accountId,
    amount,
  }));
};

// Initialize app state
const initializeAppState = (): AppState => {
  const initialMonth = createNewMonth();

  return {
    accounts: defaultAccounts,
    categories: defaultCategories,
    months: [initialMonth],
    currentMonthId: initialMonth.id,
    goals: [],
  };
};

// Load data from localStorage
export const loadData = (): AppState => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Ensure backward compatibility by adding goals if missing
      if (!parsed.goals) {
        parsed.goals = [];
      }
      return parsed;
    }
    return initializeAppState();
  } catch (error) {
    console.error("Error loading data:", error);
    return initializeAppState();
  }
};

// Save data to localStorage
export const saveData = (data: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

// Create a new month based on the current one
export const createNextMonth = (state: AppState): AppState => {
  const currentMonth = state.months.find((m) => m.id === state.currentMonthId);
  if (!currentMonth) return state;

  const newMonth = createNewMonth(currentMonth);

  // Check if month already exists
  if (state.months.some((m) => m.id === newMonth.id)) {
    return state;
  }

  return {
    ...state,
    months: [...state.months, newMonth],
    currentMonthId: newMonth.id,
  };
};

// Get total income for a month
export const getTotalMonthlyIncome = (month: Month): number => {
  return month.incomes.reduce((total, income) => total + income.amount, 0);
};

// Get total expenses for a month
export const getTotalMonthlyExpenses = (month: Month): number => {
  return month.expenses.reduce((total, expense) => total + expense.amount, 0);
};

// Generate unique ID
export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
