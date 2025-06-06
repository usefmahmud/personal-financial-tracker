import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  PieChart,
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  CreditCard,
  Tag,
  Target,
  Menu,
  X,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const currentMonth = state.months.find((m) => m.id === state.currentMonthId);

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-700 flex items-center">
            <DollarSign className="mr-2" size={24} />
            FinanceTracker
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <a
                href="#dashboard"
                className={`flex items-center px-4 py-3  hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                  activeView === "dashboard"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <LayoutDashboard className="mr-3" size={20} />
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="#income"
                className={`flex items-center px-4 py-3  hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                  activeView === "income"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <DollarSign className="mr-3" size={20} />
                Income
              </a>
            </li>
            <li>
              <a
                href="#expenses"
                className={`flex items-center px-4 py-3  hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                  activeView === "expenses"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <CreditCard className="mr-3" size={20} />
                Expenses
              </a>
            </li>
            <li>
              <a
                href="#accounts"
                className={`flex items-center px-4 py-3  hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                  activeView === "accounts"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <PieChart className="mr-3" size={20} />
                Accounts
              </a>
            </li>{" "}
            <li>
              <a
                href="#categories"
                className={`flex items-center px-4 py-3  hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                  activeView === "categories"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <Tag className="mr-3" size={20} />
                Categories
              </a>
            </li>
            <li>
              <a
                href="#goals"
                className={`flex items-center px-4 py-3  hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                  activeView === "goals"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <Target className="mr-3" size={20} />
                Goals
              </a>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <CalendarDays className="mr-2" size={16} />
              {currentMonth?.name || "Current Month"}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden w-full h-16 bg-white border-b border-gray-200 fixed top-0 left-0 z-10 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-blue-700 flex items-center">
          <DollarSign className="mr-2" size={20} />
          FinanceTracker
        </h1>

        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-white">
          <div className="flex justify-end p-4 border-b border-gray-200">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="#dashboard"
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                    activeView === "dashboard" ? "bg-blue-50 text-blue-700" : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <LayoutDashboard className="mr-3" size={20} />
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#income"
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                    activeView === "income" ? "bg-blue-50 text-blue-700" : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <DollarSign className="mr-3" size={20} />
                  Income
                </a>
              </li>
              <li>
                <a
                  href="#expenses"
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                    activeView === "expenses" ? "bg-blue-50 text-blue-700" : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <CreditCard className="mr-3" size={20} />
                  Expenses
                </a>
              </li>
              <li>
                <a
                  href="#accounts"
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                    activeView === "accounts" ? "bg-blue-50 text-blue-700" : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <PieChart className="mr-3" size={20} />
                  Accounts
                </a>
              </li>{" "}
              <li>
                <a
                  href="#categories"
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                    activeView === "categories"
                      ? "bg-blue-50 text-blue-700"
                      : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <Tag className="mr-3" size={20} />
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="#goals"
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors ${
                    activeView === "goals" ? "bg-blue-50 text-blue-700" : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <Target className="mr-3" size={20} />
                  Goals
                </a>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <CalendarDays className="mr-2" size={16} />
              {currentMonth?.name || "Current Month"}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col  mt-16 md:mt-0 overflow-auto">
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
