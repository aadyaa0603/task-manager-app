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

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,   // ✅ FIXED
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

      if (Notification.permission === "granted") {
        reminderTasks.forEach((task) => {
          new Notification("⏰ Task Reminder", {
            body: `${task.title} is due soon`,   // ✅ FIXED
          });
        });
      }
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
                className="
                  w-full text-left
                  bg-gray-100 dark:bg-gray-700
                  hover:bg-purple-500 hover:text-white
                  text-gray-800 dark:text-white
                  p-4 rounded-2xl
                  font-semibold
                  transition duration-300
                "
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (UNCHANGED) */}
      <div className="flex-1">
        <div className="p-10">

          {/* Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Upcoming Tasks
              </h2>

              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-semibold">
                {tasks.length} Tasks
              </span>
            </div>

            <div className="space-y-5">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task._id} className="bg-gray-50 dark:bg-gray-700 p-5 rounded-3xl">
                    <h3 className="text-xl font-bold text-white">{task.title}</h3>

                    <p className="text-sm text-red-400 mt-2">
                      {task.deadline &&
                        new Date(task.deadline).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400">No Tasks Available</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Notifications */}
      <div className="fixed bottom-5 right-5 z-50 space-y-4">
        {showNotifications.map((task) => (
          <div key={task._id} className="bg-white p-5 rounded-2xl shadow-xl">
            <h3 className="font-bold">⏰ Task Reminder</h3>

            <p>{task.title} is due soon</p>

            <p className="text-red-500 text-sm">
              {task.deadline &&
                new Date(task.deadline).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;