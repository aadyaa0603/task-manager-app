import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import API from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();
  const profileRef = useRef();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showNotifications, setShowNotifications] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const categories = [
    "Personal",
    "Office",
    "Study",
    "Fitness",
    "Friends & Social",
    "Projects",
    "Shopping",
    "Events & Meetups",
  ];

  const stages = ["To Do", "In Progress", "Done"];

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      requestNotificationPermission();
      fetchTasks();
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // ✅ DRAG AND DROP (ONLY NEW FEATURE)
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStage = result.destination.droppableId;

    try {
      await API.put(
        `/api/tasks/${taskId}`,
        { stage: newStage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, stage: newStage } : task
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(res.data);

      const reminderTasks = res.data.filter((task) => {
        if (task.stage === "Done" || !task.deadline) return false;

        const now = new Date();
        const due = new Date(task.deadline);

        const diffHours = (due - now) / (1000 * 60 * 60);

        return diffHours <= 24 && diffHours > 0;
      });

      setShowNotifications(reminderTasks);
    } catch (error) {
      console.log(error);
    }
  };

  const selectedDateTasks = tasks.filter((task) => {
    if (!task.deadline) return false;

    const taskDate = new Date(task.deadline);

    return (
      taskDate.getDate() === selectedDate.getDate() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex transition duration-300">

        {/* Sidebar */}
        <div
          className={`
            fixed top-0 left-0 h-full
            bg-white dark:bg-gray-800
            shadow-2xl z-50
            transition-all duration-300
            ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}
          `}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Categories
              </h2>

              <button
                onClick={() => setSidebarOpen(false)}
                className="text-4xl text-gray-700 dark:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    navigate(`/dashboard/${encodeURIComponent(category)}`)
                  }
                  className="w-full text-left bg-gray-100 dark:bg-gray-700 hover:bg-purple-500 hover:text-white text-gray-800 dark:text-white p-4 rounded-2xl font-semibold transition duration-300"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1">

          {/* Navbar */}
          <div className="bg-white dark:bg-gray-800 shadow-lg px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-4xl text-gray-700 dark:text-white hover:text-purple-500"
              >
                ☰
              </button>

              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Welcome back, {user?.name}
                </h1>

                <p className="text-gray-500 dark:text-gray-300 mt-1">
                  Stay productive 🚀
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-10">

            {/* TASK BOARD (DRAG DROP) */}
            <div className="grid md:grid-cols-3 gap-6 mt-10">

              {stages.map((stage) => (
                <Droppable droppableId={stage} key={stage}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white dark:bg-gray-800 rounded-3xl p-6 min-h-[500px]"
                    >
                      <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-white">
                        {stage}
                      </h2>

                      {tasks
                        .filter((t) => t.stage === stage)
                        .map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-gray-100 dark:bg-gray-700 p-4 mb-4 rounded-xl"
                              >
                                <h3 className="font-bold text-gray-800 dark:text-white">
                                  {task.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {task.description}
                                </p>
                              </div>
                            )}
                          </Draggable>
                        ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}

            </div>

            {/* Calendar (UNCHANGED) */}
            <div className="mt-10">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
              />
            </div>

          </div>
        </div>
      </div>
    </DragDropContext>
  );
}

export default Dashboard;