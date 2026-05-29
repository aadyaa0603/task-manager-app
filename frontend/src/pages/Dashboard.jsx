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

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {

        setShowProfileMenu(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

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
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(res.data);

      const reminderTasks = res.data.filter((task) => {

        if (
          task.stage === "Done" ||
          !task.deadline
        ) {
          return false;
        }

        const now = new Date();

        const due = new Date(task.deadline);

        const diffHours =
          (due - now) / (1000 * 60 * 60);

        return diffHours <= 24 && diffHours > 0;

      });

      setShowNotifications(reminderTasks);

      if (Notification.permission === "granted") {

        reminderTasks.forEach((task) => {

          new Notification("⏰ Task Reminder", {
            body: `${task.title} is due soon`,
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
                  navigate(
                    `/dashboard/${encodeURIComponent(category)}`
                  )
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

      {/* Main Content */}

      <div className="flex-1">

        {/* Navbar */}

        <div className="bg-white dark:bg-gray-800 shadow-lg px-8 py-5 flex items-center justify-between">

          <div className="flex items-center gap-5">

            <button
              onClick={() => setSidebarOpen(true)}
              className="
                text-4xl
                text-gray-700 dark:text-white
                hover:text-purple-500
                transition
              "
            >
              ☰
            </button>

            <div>

              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">

                Welcome back,
                {" "}
                {user?.name}

              </h1>

              <p className="text-gray-500 dark:text-gray-300 mt-1">
                Stay productive and manage tasks efficiently 🚀
              </p>

            </div>

          </div>

          <div className="flex items-center gap-4">

            {/* Dark Mode */}

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

            {/* Profile */}

            <div
              className="relative"
              ref={profileRef}
            >

              <button
                onClick={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
                className="
                  w-14 h-14 rounded-full
                  bg-gradient-to-r from-pink-500 to-purple-500
                  text-white font-bold text-xl
                  flex items-center justify-center
                  shadow-xl hover:scale-105
                  transition duration-300
                "
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>

              {showProfileMenu && (

                <div
                  className="
                    absolute right-0 mt-4 w-72
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-3xl shadow-2xl
                    p-6 z-50
                  "
                >

                  <div className="flex items-center gap-4 mb-6">

                    <div
                      className="
                        w-16 h-16 rounded-full
                        bg-gradient-to-r from-pink-500 to-purple-500
                        text-white text-2xl font-bold
                        flex items-center justify-center
                      "
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>

                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {user?.name}
                      </h2>

                      <p className="text-gray-500 dark:text-gray-300">
                        {user?.email}
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() => {

                      localStorage.removeItem("token");

                      localStorage.removeItem("user");

                      window.location.href = "/";

                    }}
                    className="
                      w-full
                      bg-red-500 hover:bg-red-600
                      text-white py-3 rounded-2xl
                      font-semibold transition
                    "
                  >
                    Logout
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

        {/* Body */}

        <div className="p-10">

          {/* Hero */}

          <div
            className="
              bg-gradient-to-r from-purple-500 to-pink-500
              rounded-3xl p-10
              text-white shadow-2xl
            "
          >

            <h2 className="text-5xl font-bold mb-5">
              Smart Productivity Dashboard
            </h2>

            <p className="text-xl opacity-90 max-w-2xl">
              Organize tasks, track deadlines,
              and stay productive with your
              intelligent task management system.
            </p>

          </div>

          {/* Main Grid */}

          <div className="grid lg:grid-cols-2 gap-8 mt-10">

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

              <div className="space-y-5 max-h-[650px] overflow-y-auto pr-2">

                {tasks.length > 0 ? (

                  tasks.map((task) => (

                    <div
                      key={task._id}
                      className="
                        bg-gray-50 dark:bg-gray-700
                        border border-gray-200 dark:border-gray-600
                        rounded-3xl p-5
                        hover:shadow-xl transition
                      "
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {task.title}
                          </h3>

                          <p className="text-gray-500 dark:text-gray-300 mt-3">
                            {task.description}
                          </p>

                        </div>

                        <span
                          className="
                            bg-pink-100 text-pink-600
                            px-3 py-2 rounded-xl
                            text-sm font-semibold
                          "
                        >
                          {task.category}
                        </span>

                      </div>

                      <div className="flex items-center justify-between mt-6">

                        <span
                          className="
                            bg-blue-100 text-blue-700
                            px-3 py-2 rounded-lg
                            text-sm font-semibold
                          "
                        >
                          {task.stage}
                        </span>

                        {task.deadline && (

                          <p className="text-red-500 font-semibold text-sm">
                            {new Date(task.deadline).toLocaleString("en-IN")}
                          </p>

                        )}

                      </div>

                    </div>

                  ))

                ) : (

                  <div className="text-center py-20 text-gray-400 text-xl font-semibold">
                    No Tasks Available
                  </div>

                )}

              </div>

            </div>

            {/* Calendar */}

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">

              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Task Calendar
              </h2>

              <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700">

                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  className="w-full border-none"
                />

              </div>

              <div className="mt-8">

                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-5">
                  Tasks for
                  {" "}
                  {selectedDate.toDateString()}
                </h3>

                <div className="space-y-4">

                  {selectedDateTasks.length > 0 ? (

                    selectedDateTasks.map((task) => (

                      <div
                        key={task._id}
                        className="
                          bg-gray-50 dark:bg-gray-700
                          border border-gray-200 dark:border-gray-600
                          rounded-2xl p-5
                        "
                      >

                        <div className="flex items-center justify-between">

                          <div>

                            <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                              {task.title}
                            </h4>

                            <p className="text-gray-500 dark:text-gray-300 mt-1">
                              {task.category}
                            </p>

                          </div>

                          <span
                            className="
                              bg-purple-100 text-purple-700
                              px-3 py-2 rounded-xl
                              text-sm font-semibold
                            "
                          >
                            {task.stage}
                          </span>

                        </div>

                      </div>

                    ))

                  ) : (

                    <div className="text-center py-10 text-gray-400 text-lg font-semibold">
                      No Tasks For This Day
                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
      

     {/* Floating Add Task Button */}

<button
  onClick={() =>
    navigate("/dashboard/create-task")
  }
  className="
    fixed bottom-6 left-6 z-50
    bg-gradient-to-r
    from-pink-500 to-purple-500
    hover:scale-110
    transition duration-300
    text-white
    w-16 h-16 rounded-full
    shadow-2xl
    text-5xl font-light
    flex items-center justify-center
  "
>
  +
</button>
      {/* Notifications */}

      <div className="fixed bottom-5 right-5 z-50 space-y-4">

        {showNotifications.map((task) => (

          <div
            key={task._id}
            className="
              bg-white dark:bg-gray-800
              border-l-4 border-red-500
              shadow-2xl rounded-2xl
              p-5 w-80
            "
          >

            <div className="flex justify-between items-start">

              <div>

                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  ⏰ Task Reminder
                </h3>

                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  <span className="font-semibold">
                    {task.title}
                  </span>
                  {" "}
                  is due soon.
                </p>

                <p className="text-sm text-red-500 mt-2">
                  Deadline:
                  {" "}
                  {new Date(task.deadline).toLocaleString("en-IN")}
                </p>

              </div>

              <button
                onClick={() => {

                  setShowNotifications(
                    showNotifications.filter(
                      (item) => item._id !== task._id
                    )
                  );

                }}
                className="text-gray-400 hover:text-black dark:hover:text-white text-xl"
              >
                ×
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Dashboard;