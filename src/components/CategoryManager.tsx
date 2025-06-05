import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { generateId } from "../utils/storage";
import { Category } from "../types";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import MonthSelector from "./MonthSelector";

const CategoryManager: React.FC = () => {
  const { state, dispatch, getCurrentMonth } = useAppContext();
  const currentMonth = getCurrentMonth();

  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [name, setName] = useState("");
  const [color, setColor] = useState("#38b000");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (editingCategoryId) {
      // Update existing category
      const updatedCategory: Category = {
        id: editingCategoryId,
        name,
        color,
      };

      dispatch({ type: "UPDATE_CATEGORY", payload: updatedCategory });
    } else {
      // Create new category
      const newCategory: Category = {
        id: generateId("category"),
        name,
        color,
      };

      dispatch({ type: "ADD_CATEGORY", payload: newCategory });
    }

    resetForm();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setColor(category.color);
    setShowForm(true);
  };

  const handleDeleteCategory = (id: string) => {
    // Check if category is used in current expenses
    if (!currentMonth) return;

    const isUsedInExpenses = currentMonth.expenses.some(
      (expense) => expense.categoryId === id
    );

    if (isUsedInExpenses) {
      alert(
        "Cannot delete category because it is used in expenses. Remove the expenses first."
      );
      return;
    }

    if (confirm("Are you sure you want to delete this category?")) {
      dispatch({ type: "DELETE_CATEGORY", payload: id });
    }
  };

  const resetForm = () => {
    setName("");
    setColor("#38b000");
    setEditingCategoryId(null);
    setShowForm(false);
  };

  // Calculate usage count for each category
  const calculateCategoryUsage = (categoryId: string): number => {
    if (!currentMonth) return 0;

    return currentMonth.expenses.filter(
      (expense) => expense.categoryId === categoryId
    ).length;
  };

  if (!currentMonth) {
    return <div>No month data available</div>;
  }

  return (
    <div className="space-y-6">
      <MonthSelector />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} className="mr-2" />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingCategoryId ? "Edit Category" : "Add New Category"}
          </h2>

          <form onSubmit={handleAddCategory}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Food, Transportation, etc."
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
                {editingCategoryId ? "Update Category" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.categories.map((category) => {
          const usageCount = calculateCategoryUsage(category.id);

          return (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden border-l-4 hover:shadow-md transition-shadow"
              style={{ borderColor: category.color }}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Tag size={20} style={{ color: category.color }} />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {usageCount} {usageCount === 1 ? "expense" : "expenses"}{" "}
                        this month
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex-wrap flex">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryManager;
