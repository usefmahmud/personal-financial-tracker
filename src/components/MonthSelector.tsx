import React from "react";
import { useAppContext } from "../context/AppContext";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const MonthSelector: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const handleChangeMonth = (id: string) => {
    dispatch({ type: "SET_CURRENT_MONTH", payload: id });
  };

  const handleCreateNextMonth = () => {
    dispatch({ type: "CREATE_NEXT_MONTH" });
  };

  // Sort months chronologically
  const sortedMonths = [...state.months].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const currentMonthIndex = sortedMonths.findIndex(
    (month) => month.id === state.currentMonthId
  );

  const prevMonth =
    currentMonthIndex > 0 ? sortedMonths[currentMonthIndex - 1] : null;
  const nextMonth =
    currentMonthIndex < sortedMonths.length - 1
      ? sortedMonths[currentMonthIndex + 1]
      : null;
  const currentMonth = sortedMonths[currentMonthIndex];

  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
      <button
        onClick={() => prevMonth && handleChangeMonth(prevMonth.id)}
        disabled={!prevMonth}
        className={`p-2 rounded-full ${
          prevMonth
            ? "hover:bg-gray-100 text-gray-700"
            : "text-gray-300 cursor-not-allowed"
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {currentMonth?.name}
        </h2>
      </div>

      <div className="flex">
        {nextMonth ? (
          <button
            onClick={() => handleChangeMonth(nextMonth.id)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
          >
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleCreateNextMonth}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={16} className="mr-1" />
            <span className="text-sm">New Month</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MonthSelector;
