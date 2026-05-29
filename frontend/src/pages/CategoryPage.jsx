import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

function CategoryPage() {

  const { category } = useParams();

  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  const [editingTask, setEditingTask] = useState(null);

  const [draggedTask, setDraggedTask] = useState(null);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stage: "Todo",
    deadline: "",
  });

  useEffect(() => {

    if (!token) {
      navigate("/");
    } else {
      fetchTasks();
    }

  }, [category]);

  useEffect(() => {

    if (darkMode) {

      document.documentElement.classList.add("dark");

      localStorage.setItem("theme", "dark");

    } else {

      document.documentElement.classList.remove("dark");

      localStorage.setItem("theme", "light");

    }

  }, [darkMode]);

  const fetchTasks = async () => {

    try {

      const res = await API.get("/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const filteredTasks = res.data.filter(
        (task) => task.category === category
      );

      setTasks(filteredTasks);

    } catch (error) {
      console.log(error);
    }

  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const createTask = async () => {

    try {

      await API.post(
        "/api/tasks",
        {
          ...formData,
          category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData({
        title: "",
        description: "",
        stage: "Todo",
        deadline: "",
      });

      fetchTasks();

    } catch (error) {
      console.log(error);
    }

  };

  const updateTask = async () => {

    try {

      await API.put(
        `/tasks/${editingTask._id}`,
        {
          ...formData,
          category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingTask(null);

      setFormData({
        title: "",
        description: "",
        stage: "Todo",
        deadline: "",
      });

      fetchTasks();

    } catch (error) {
      console.log(error);
    }

  };

  const deleteTask = async (id) => {

    try {

      await API.delete(`/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTasks();

    } catch (error) {
      console.log(error);
    }

  };

  const handleDragStart = (task) => {

    setDraggedTask(task);

  };

  const handleDrop = async (stage) => {

    if (!draggedTask) return;

    try {

      await API.put(
        `/tasks/${draggedTask._id}`,
        {
          ...draggedTask,
          stage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();

    } catch (error) {
      console.log(error);
    }

  };

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition duration-300">

      {/* Navbar */}

      <div className="bg-white dark:bg-gray-800 shadow p-5 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            {category}
          </h1>

          <p className="text-gray-500 dark:text-gray-300 mt-2">
            Manage your category tasks efficiently
          </p>

        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="
              bg-gray-200 dark:bg-gray-700
              text-black dark:text-white
              px-5 py-3 rounded-xl
              font-semibold transition
            "
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="
              bg-purple-500 hover:bg-purple-600
              text-white px-5 py-3 rounded-xl
              font-semibold transition
            "
          >
            Dashboard
          </button>

        </div>

      </div>

      <div className="p-10">

        {/* Create / Edit Task */}

        <div
          className="
            bg-white dark:bg-gray-800
            rounded-3xl shadow-xl
            p-8 mb-10
          "
        >

          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">

            {editingTask ? "Update Task" : "Create Task"}

          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="text"
              name="title"
              placeholder="Task Title"
              value={formData.title}
              onChange={handleChange}
              className="
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-black dark:text-white
                p-4 rounded-xl
              "
            />

            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-black dark:text-white
                p-4 rounded-xl
              "
            >
              <option>Todo</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>

          </div>

          <textarea
            name="description"
            placeholder="Task Description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="
              mt-4 w-full
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700
              text-black dark:text-white
              p-4 rounded-xl
            "
          />

          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="
              mt-4 w-full
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700
              text-black dark:text-white
              p-4 rounded-xl
            "
          />

          <button
            onClick={
              editingTask
                ? updateTask
                : createTask
            }
            className="
              mt-6
              bg-gradient-to-r from-pink-500 to-purple-500
              text-white px-8 py-4
              rounded-2xl font-bold
              hover:scale-105 transition duration-300
            "
          >

            {editingTask ? "Update Task" : "Create Task"}

          </button>

        </div>

        {/* Drag & Drop Columns */}

        <div className="grid lg:grid-cols-3 gap-8">

          {[
            {
              title: "Todo",
              color: "border-yellow-400",
            },
            {
              title: "In Progress",
              color: "border-blue-400",
            },
            {
              title: "Done",
              color: "border-green-400",
            },
          ].map((stageData) => (

            <div
              key={stageData.title}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stageData.title)}
              className={`
                bg-white dark:bg-gray-800
                rounded-3xl shadow-xl
                border-t-4 ${stageData.color}
                p-6 min-h-[500px]
              `}
            >

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stageData.title}
                </h2>

                <span
                  className="
                    bg-purple-100 text-purple-700
                    px-3 py-2 rounded-xl
                    text-sm font-semibold
                  "
                >
                  {
                    tasks.filter(
                      (task) =>
                        task.stage === stageData.title
                    ).length
                  }
                </span>

              </div>

              <div className="space-y-5">

                {tasks
                  .filter(
                    (task) =>
                      task.stage === stageData.title
                  )
                  .map((task) => (

                    <div
                      key={task._id}
                      draggable
                      onDragStart={() =>
                        handleDragStart(task)
                      }
                      className="
                        bg-gray-50 dark:bg-gray-700
                        border border-gray-200 dark:border-gray-600
                        rounded-2xl p-5
                        hover:shadow-2xl
                        transition duration-300
                        cursor-grab active:cursor-grabbing
                      "
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {task.title}
                          </h3>

                          <p className="text-gray-500 dark:text-gray-300 mt-2">
                            {task.description}
                          </p>

                        </div>

                      </div>

                      {task.deadline && (

                        <p className="text-red-500 text-sm font-semibold mt-4">
                          {new Date(task.deadline).toLocaleString("en-IN")}
                        </p>

                      )}

                      <div className="flex gap-3 mt-6">

                        <button
                          onClick={() => {

                            setEditingTask(task);

                            setFormData({
                              title: task.title,
                              description: task.description,
                              stage: task.stage,
                              deadline: task.deadline
                                ? new Date(task.deadline)
                                    .toISOString()
                                    .slice(0, 16)
                                : "",
                            });

                            window.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });

                          }}
                          className="
                            bg-blue-500 hover:bg-blue-600
                            text-white px-4 py-2
                            rounded-xl font-semibold
                            transition
                          "
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteTask(task._id)
                          }
                          className="
                            bg-red-500 hover:bg-red-600
                            text-white px-4 py-2
                            rounded-xl font-semibold
                            transition
                          "
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  ))}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default CategoryPage;