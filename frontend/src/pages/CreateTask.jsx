import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function CreateTask() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stage: "Todo",
    category: "Personal",
    deadline: "",
  });

  const categories = [
    "Personal", "Office", "Study", "Fitness",
    "Friends & Social", "Projects", "Shopping", "Events & Meetups",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const createTask = async (e) => {
  e.preventDefault();

  console.log("Sending deadline:", formData.deadline);
  console.log("Full form data:", formData);

  try {
    setLoading(true);

    await API.post("/api/tasks", { ...formData });

    const selectedCategory = formData.category;

    setFormData({
      title: "",
      description: "",
      stage: "Todo",
      category: "Personal",
      deadline: "",
    });

    navigate(`/dashboard/${encodeURIComponent(selectedCategory)}`);
  } catch (error) {
    console.log(error);
    alert("Task Creation Failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6 transition duration-300">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-10">

        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white">Create New Task</h1>
          <p className="text-gray-500 dark:text-gray-300 mt-3 text-lg">
            Organize your productivity efficiently 🚀
          </p>
        </div>

        <form onSubmit={createTask} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block mb-3 text-lg font-semibold text-gray-700 dark:text-white">
              Task Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-3 text-lg font-semibold text-gray-700 dark:text-white">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Stage */}
          <div>
            <label className="block mb-3 text-lg font-semibold text-gray-700 dark:text-white">
              Task Stage
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block mb-3 text-lg font-semibold text-gray-700 dark:text-white">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block mb-3 text-lg font-semibold text-gray-700 dark:text-white">
              Deadline (IST)
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-5 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105 transition duration-300 text-white py-4 rounded-2xl font-bold text-lg shadow-xl disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-2xl bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:scale-105 transition"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateTask;