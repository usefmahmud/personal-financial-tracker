export interface Account {
  id: string;
  name: string;
  balance: number;
  color: string;
  isSavings?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  accountId: string;
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  date: string;
  distributions: {
    accountId: string;
    amount: number;
  }[];
}

export interface Month {
  id: string;
  name: string;
  year: number;
  month: number; // 0-11
  incomes: Income[];
  expenses: Expense[];
  startingBalances: {
    accountId: string;
    amount: number;
  }[];
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  dueDate: string;
  createdDate: string;
  isCompleted: boolean;
  completedDate?: string;
}

export interface AppState {
  accounts: Account[];
  categories: Category[];
  months: Month[];
  currentMonthId: string;
  goals: Goal[];
}
