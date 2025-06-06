import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { AppState, Income, Expense, Account, Category, Month, Goal } from "../types";
import { loadData, saveData, createNextMonth } from "../utils/storage";

// Define action types
type AppAction =
  | { type: "SET_CURRENT_MONTH"; payload: string }
  | { type: "ADD_INCOME"; payload: Income }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "ADD_ACCOUNT"; payload: Account }
  | { type: "UPDATE_ACCOUNT"; payload: Account }
  | { type: "DELETE_ACCOUNT"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "CREATE_NEXT_MONTH" }
  | { type: "DELETE_INCOME"; payload: string }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "UPDATE_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "COMPLETE_GOAL"; payload: { goalId: string; expenseData: Expense } }
  | { type: "COMPLETE_GOAL_WITH_CATEGORY"; payload: { goalId: string; expenseData: Expense; goalCategory: Category } };

// Create the context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getCurrentMonth: () => Month | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_CURRENT_MONTH":
      return {
        ...state,
        currentMonthId: action.payload,
      };

    case "ADD_INCOME": {
      const currentMonth = state.months.find(
        (m) => m.id === state.currentMonthId
      );
      if (!currentMonth) return state;

      const updatedMonths = state.months.map((month) => {
        if (month.id === state.currentMonthId) {
          return {
            ...month,
            incomes: [...month.incomes, action.payload],
          };
        }
        return month;
      });

      return {
        ...state,
        months: updatedMonths,
      };
    }

    case "ADD_EXPENSE": {
      const currentMonth = state.months.find(
        (m) => m.id === state.currentMonthId
      );
      if (!currentMonth) return state;

      const updatedMonths = state.months.map((month) => {
        if (month.id === state.currentMonthId) {
          return {
            ...month,
            expenses: [...month.expenses, action.payload],
          };
        }
        return month;
      });

      return {
        ...state,
        months: updatedMonths,
      };
    }

    case "ADD_ACCOUNT":
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
      };

    case "UPDATE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === action.payload.id ? action.payload : account
        ),
      };

    case "DELETE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.filter(
          (account) => account.id !== action.payload
        ),
      };

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        ),
      };

    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.payload
        ),
      };

    case "CREATE_NEXT_MONTH":
      return createNextMonth(state);

    case "DELETE_INCOME": {
      const updatedMonths = state.months.map((month) => {
        if (month.id === state.currentMonthId) {
          return {
            ...month,
            incomes: month.incomes.filter(
              (income) => income.id !== action.payload
            ),
          };
        }
        return month;
      });

      return {
        ...state,
        months: updatedMonths,
      };
    }

    case "DELETE_EXPENSE": {
      const updatedMonths = state.months.map((month) => {
        if (month.id === state.currentMonthId) {
          return {
            ...month,
            expenses: month.expenses.filter(
              (expense) => expense.id !== action.payload
            ),
          };
        }
        return month;
      });

      return {
        ...state,
        months: updatedMonths,
      };
    }

    case "ADD_GOAL":
      return {
        ...state,
        goals: [...state.goals, action.payload],
      };

    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      };

    case "DELETE_GOAL":
      return {
        ...state,
        goals: state.goals.filter((goal) => goal.id !== action.payload),
      };

    case "COMPLETE_GOAL": {
      const updatedGoals = state.goals.map((goal) =>
        goal.id === action.payload.goalId
          ? { ...goal, isCompleted: true, completedDate: new Date().toISOString() }
          : goal
      );

      const updatedMonths = state.months.map((month) => {
        if (month.id === state.currentMonthId) {
          return {
            ...month,
            expenses: [...month.expenses, action.payload.expenseData],
          };
        }
        return month;
      });

      return {
        ...state,
        goals: updatedGoals,
        months: updatedMonths,
      };
    }

    case "COMPLETE_GOAL_WITH_CATEGORY": {
      const updatedGoals = state.goals.map((goal) =>
        goal.id === action.payload.goalId
          ? { ...goal, isCompleted: true, completedDate: new Date().toISOString() }
          : goal
      );

      const updatedMonths = state.months.map((month) => {
        if (month.id === state.currentMonthId) {
          return {
            ...month,
            expenses: [...month.expenses, action.payload.expenseData],
          };
        }
        return month;
      });

      const updatedCategories = [...state.categories];
      const categoryExists = updatedCategories.some((cat) => cat.id === action.payload.goalCategory.id);
      if (!categoryExists) {
        updatedCategories.push(action.payload.goalCategory);
      }

      return {
        ...state,
        goals: updatedGoals,
        months: updatedMonths,
        categories: updatedCategories,
      };
    }

    default:
      return state;
  }
};

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, loadData());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveData(state);
  }, [state]);

  const getCurrentMonth = (): Month | undefined => {
    return state.months.find((m) => m.id === state.currentMonthId);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getCurrentMonth }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
