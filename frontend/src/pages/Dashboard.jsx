
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

  // ---------------- DRAG FUNCTION ----------------
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
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- EFFECTS ----------------
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
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(res.data);

      const reminderTasks = res.data.filter((task) => {
        if (task.stage === "Done" || !task.deadline) return false;

        const diffHours =
          (new Date(task.deadline) - new Date()) /
          (1000 * 60 * 60);

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
    } catch (err) {
      console.log(err);
    }
  };

  const selectedDateTasks = tasks.filter((task) => {
    if (!task.deadline) return false;

    const d = new Date(task.deadline);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">

      {/* SIDEBAR (unchanged) */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-2xl z-50 transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-0 overflow-hidden"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between mb-10">
            <h2 className="text-2xl font-bold text-white">Categories</h2>
            <button onClick={() => setSidebarOpen(false)}>×</button>
          </div>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                navigate(`/dashboard/${encodeURIComponent(cat)}`)
              }
              className="block w-full text-left p-3 mb-2 bg-gray-200 dark:bg-gray-700 rounded-xl"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">
            Welcome {user?.name}
          </h1>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* DRAG DROP BOARD */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid md:grid-cols-3 gap-6">

              {stages.map((stage) => (
                <Droppable droppableId={stage} key={stage}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white dark:bg-gray-800 p-4 rounded-xl min-h-[500px]"
                    >
                      <h2 className="font-bold text-xl mb-4">
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
                                className="bg-gray-100 dark:bg-gray-700 p-3 mb-3 rounded-xl"
                              >
                                <h3 className="font-bold">
                                  {task.title}
                                </h3>
                                <p>{task.category}</p>
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
          </DragDropContext>

          {/* CALENDAR */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
            />

            <h3 className="mt-4 font-bold">
              Tasks for {selectedDate.toDateString()}
            </h3>

            {selectedDateTasks.map((task) => (
              <div key={task._id} className="p-3 bg-gray-100 rounded mt-2">
                {task.title}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;

