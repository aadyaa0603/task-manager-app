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
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [taskFilter, setTaskFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "", description: "", stage: "", category: "", deadline: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const categories = [
    "Personal", "Office", "Study", "Fitness",
    "Friends & Social", "Projects", "Shopping", "Events & Meetups",
  ];

  const stages = ["Todo", "In Progress", "Done"];

  // ── IST helpers ─────────────────────────────────────────────────────────────
  const toISTInputValue = (utcDateStr) => {
    if (!utcDateStr) return "";
    const istMs = new Date(utcDateStr).getTime() + (330 * 60 * 1000);
    return new Date(istMs).toISOString().slice(0, 16);
  };

  const fromISTInputValue = (localStr) => {
    if (!localStr) return "";
    const istMs = new Date(localStr).getTime() - (330 * 60 * 1000);
    return new Date(istMs).toISOString();
  };

  const formatIST = (utcDateStr) => {
    if (!utcDateStr) return "";
    return new Date(utcDateStr).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    else { requestNotificationPermission(); fetchTasks(); }
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
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setEditingTask(null); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // ── API calls ────────────────────────────────────────────────────────────────
  const requestNotificationPermission = async () => {
    if ("Notification" in window) await Notification.requestPermission();
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/api/tasks");
      setTasks(res.data);

      const reminderTasks = res.data.filter((task) => {
        if (task.stage === "Done" || !task.deadline) return false;
        const diffHours = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60);
        return diffHours <= 24 && diffHours > 0;
      });
      setShowNotifications(reminderTasks);

      if (Notification.permission === "granted") {
        reminderTasks.forEach((task) => {
          new Notification("⏰ Task Reminder", { body: `${task.title} is due soon` });
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    setDeleteLoadingId(taskId);
    try {
      await API.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setShowNotifications((prev) => prev.filter((t) => t._id !== taskId));
    } catch (error) {
      alert("Failed to delete task. Please try again.");
      console.log(error);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title || "",
      description: task.description || "",
      stage: task.stage || "",
      category: task.category || "",
      deadline: toISTInputValue(task.deadline),
    });
  };

  const handleEditSave = async () => {
    if (!editForm.title.trim()) { alert("Title is required."); return; }
    setEditLoading(true);
    try {
      const payload = { ...editForm, deadline: fromISTInputValue(editForm.deadline) };
      const res = await API.put(`/api/tasks/${editingTask._id}`, payload);
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data : t)));
      setEditingTask(null);
    } catch (error) {
      alert("Failed to update task. Please try again.");
      console.log(error);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const now = new Date();

  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "All") return true;
    if (!task.deadline) return false;
    const due = new Date(task.deadline);
    if (taskFilter === "Upcoming") return due > now && task.stage !== "Done";
    if (taskFilter === "Overdue") return due < now && task.stage !== "Done";
    return true;
  });

  const selectedDateTasks = tasks.filter((task) => {
    if (!task.deadline) return false;
    const istMs = new Date(task.deadline).getTime() + (330 * 60 * 1000);
    const d = new Date(istMs);
    const sel = new Date(selectedDate.getTime() + (330 * 60 * 1000));
    return (
      d.getUTCDate() === sel.getUTCDate() &&
      d.getUTCMonth() === sel.getUTCMonth() &&
      d.getUTCFullYear() === sel.getUTCFullYear()
    );
  });

  const overdueCount = tasks.filter(
    (t) => t.stage !== "Done" && t.deadline && new Date(t.deadline) < now
  ).length;
  const totalBadge = overdueCount + showNotifications.length;

  const stageBadge = (stage) => {
    if (stage === "Done") return "bg-green-100 text-green-700";
    if (stage === "In Progress") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex transition duration-300">

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {editingTask && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTask(null); }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Task</h2>
              <button
                onClick={() => setEditingTask(null)}
                className="text-gray-400 hover:text-black dark:hover:text-white text-3xl leading-none"
              >×</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition resize-none"
                  placeholder="Task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Stage</label>
                  <select
                    value={editForm.stage}
                    onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  >
                    <option value="">Select stage</option>
                    {stages.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Deadline (IST)</label>
                <input
                  type="datetime-local"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setEditingTask(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 disabled:opacity-60 transition"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-2xl z-50 transition-all duration-300 ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Categories</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-4xl text-gray-700 dark:text-white">×</button>
          </div>
          <div className="space-y-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => navigate(`/dashboard/${encodeURIComponent(category)}`)}
                className="w-full text-left bg-gray-100 dark:bg-gray-700 hover:bg-purple-500 hover:text-white text-gray-800 dark:text-white p-4 rounded-2xl font-semibold transition duration-300"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1">

        {/* ── Navbar ──────────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 shadow-lg px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-4xl text-gray-700 dark:text-white hover:text-purple-500 transition"
            >☰</button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">
                Stay productive and manage tasks efficiently 🚀
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">

            {/* 🔔 Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="relative bg-gray-200 dark:bg-gray-700 text-black dark:text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition hover:bg-purple-100"
              >
                🔔
                {totalBadge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalBadge}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-6 z-50 max-h-[500px] overflow-y-auto">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Notifications</h3>
                    <button onClick={() => setShowNotifPanel(false)} className="text-gray-400 hover:text-black dark:hover:text-white text-xl">×</button>
                  </div>

                  {showNotifications.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-bold text-orange-500 uppercase tracking-wide mb-3">⏰ Due Within 24 Hours</p>
                      <div className="space-y-3">
                        {showNotifications.map((task) => (
                          <div key={task._id} className="bg-orange-50 dark:bg-gray-700 border-l-4 border-orange-400 rounded-2xl p-4 flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white">{task.title}</p>
                              <p className="text-xs text-orange-500 mt-1">Due: {formatIST(task.deadline)}</p>
                            </div>
                            <button
                              onClick={() => setShowNotifications(showNotifications.filter((n) => n._id !== task._id))}
                              className="text-gray-400 hover:text-black dark:hover:text-white text-lg"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {overdueCount > 0 && (
                    <div>
                      <p className="text-sm font-bold text-red-500 uppercase tracking-wide mb-3">🚨 Overdue Tasks</p>
                      <div className="space-y-3">
                        {tasks
                          .filter((t) => t.stage !== "Done" && t.deadline && new Date(t.deadline) < now)
                          .map((task) => (
                            <div key={task._id} className="bg-red-50 dark:bg-gray-700 border-l-4 border-red-500 rounded-2xl p-4">
                              <p className="font-semibold text-gray-800 dark:text-white">{task.title}</p>
                              <p className="text-xs text-red-500 mt-1">Was due: {formatIST(task.deadline)}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {totalBadge === 0 && (
                    <div className="text-center py-10 text-gray-400 font-semibold">✅ All caught up! No alerts.</div>
                  )}
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xl flex items-center justify-center shadow-xl hover:scale-105 transition duration-300"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-6 z-50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-2xl font-bold flex items-center justify-center">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user?.name}</h2>
                      <p className="text-gray-500 dark:text-gray-300">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.location.href = "/";
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-semibold transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────────── */}
        <div className="p-10">

          {/* Hero */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-10 text-white shadow-2xl">
            <h2 className="text-5xl font-bold mb-5">Smart Productivity Dashboard</h2>
            <p className="text-xl opacity-90 max-w-2xl">
              Organize tasks, track deadlines, and stay productive with your intelligent task management system.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            {[
              { label: "Total Tasks", count: tasks.length, color: "from-purple-400 to-purple-600", icon: "📋" },
              { label: "Upcoming", count: tasks.filter((t) => t.deadline && new Date(t.deadline) > now && t.stage !== "Done").length, color: "from-blue-400 to-blue-600", icon: "📅" },
              { label: "Overdue", count: overdueCount, color: "from-red-400 to-red-600", icon: "🚨" },
            ].map((stat) => (
              <div key={stat.label} className={`bg-gradient-to-r ${stat.color} rounded-3xl p-6 text-white shadow-xl`}>
                <p className="text-4xl mb-2">{stat.icon}</p>
                <p className="text-4xl font-bold">{stat.count}</p>
                <p className="text-lg opacity-90 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mt-10">

            {/* ── Tasks Panel ────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Tasks</h2>
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-semibold">
                  {filteredTasks.length} Tasks
                </span>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-3 mb-6">
                {["All", "Upcoming", "Overdue"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTaskFilter(tab)}
                    className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${
                      taskFilter === tab
                        ? "bg-purple-500 text-white shadow"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-100"
                    }`}
                  >
                    {tab === "Upcoming" ? "📅 " : tab === "Overdue" ? "🚨 " : "📋 "}{tab}
                  </button>
                ))}
              </div>

              <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const isOverdue = task.deadline && new Date(task.deadline) < now && task.stage !== "Done";
                    const isDueSoon = showNotifications.some((n) => n._id === task._id);
                    const isDeleting = deleteLoadingId === task._id;

                    return (
                      <div
                        key={task._id}
                        className={`border rounded-3xl p-5 transition ${
                          isOverdue
                            ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                            : isDueSoon
                            ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
                            : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-bold text-gray-800 dark:text-white truncate">
                                {task.title}
                              </h3>
                              {isOverdue && (
                                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-bold shrink-0">Overdue</span>
                              )}
                              {isDueSoon && !isOverdue && (
                                <span className="text-xs bg-orange-400 text-white px-2 py-1 rounded-lg font-bold shrink-0">Due Soon</span>
                              )}
                            </div>
                            <p className="text-gray-500 dark:text-gray-300 mt-2 text-sm line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                          <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0">
                            {task.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-5 gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${stageBadge(task.stage)}`}>
                              {task.stage}
                            </span>
                            {task.deadline && (
                              <p className={`font-semibold text-xs ${isOverdue ? "text-red-600" : "text-red-400"}`}>
                                📅 {formatIST(task.deadline)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openEditModal(task)}
                              className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-xl text-xs font-semibold transition"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              disabled={isDeleting}
                              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                            >
                              {isDeleting ? "⏳ Deleting..." : "🗑️ Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 text-gray-400 text-xl font-semibold">
                    {taskFilter === "Upcoming" ? "🎉 No upcoming tasks!" : taskFilter === "Overdue" ? "✅ No overdue tasks!" : "No Tasks Available"}
                  </div>
                )}
              </div>
            </div>

            {/* ── Calendar ───────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Task Calendar</h2>
              <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <Calendar onChange={setSelectedDate} value={selectedDate} className="w-full border-none" />
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-5">
                  Tasks for {selectedDate.toDateString()}
                </h3>
                <div className="space-y-4">
                  {selectedDateTasks.length > 0 ? (
                    selectedDateTasks.map((task) => (
                      <div key={task._id} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white truncate">{task.title}</h4>
                            <p className="text-gray-500 dark:text-gray-300 mt-1 text-sm">{task.category}</p>
                            {task.deadline && (
                              <p className="text-xs text-red-400 mt-1">📅 {formatIST(task.deadline)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-3 py-2 rounded-xl text-sm font-semibold ${stageBadge(task.stage)}`}>
                              {task.stage}
                            </span>
                            <button
                              onClick={() => openEditModal(task)}
                              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-xl text-sm font-semibold transition"
                            >✏️</button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              disabled={deleteLoadingId === task._id}
                              className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                            >
                              {deleteLoadingId === task._id ? "⏳" : "🗑️"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-400 text-lg font-semibold">No Tasks For This Day</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Add Button ───────────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/dashboard/create-task")}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-110 transition duration-300 text-white w-16 h-16 rounded-full shadow-2xl text-5xl font-light flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}

export default Dashboard;