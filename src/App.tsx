import React, { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import IncomeManager from "./components/IncomeManager";
import ExpenseManager from "./components/ExpenseManager";
import AccountManager from "./components/AccountManager";
import CategoryManager from "./components/CategoryManager";

function App() {
  const [activeView, setActiveView] = useState("dashboard");

  // Listen for hash changes to update the active view
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "dashboard";
      setActiveView(hash);
    };

    // Set initial view based on hash
    handleHashChange();

    // Add event listener
    window.addEventListener("hashchange", handleHashChange);

    // Clean up
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Render active component based on activeView
  const renderActiveView = () => {
    switch (activeView) {
      case "income":
        return <IncomeManager />;
      case "expenses":
        return <ExpenseManager />;
      case "accounts":
        return <AccountManager />;
      case "categories":
        return <CategoryManager />;
      case "dashboard":
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout>{renderActiveView()}</Layout>
    </AppProvider>
  );
}

export default App;
