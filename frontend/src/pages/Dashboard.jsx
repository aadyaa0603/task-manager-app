import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API from "../api/axios";

// ─── Tailwind dark-theme config ───────────────────────────────────────────────
// Make sure your tailwind.config.js has:  darkMode: 'class'
// and your index.css / global CSS includes the react-calendar overrides below.
//
// /* react-calendar dark overrides – paste into your global CSS */
// .dark .react-calendar { background:#141622; border:1px solid #222640; color:#e2e4f0; border-radius:12px; }
// .dark .react-calendar__tile { color:#a0a4c0; background:transparent; border-radius:8px; }
// .dark .react-calendar__tile:hover { background:#1e2235; color:#fff; }
// .dark .react-calendar__tile--now { background:#7c3aed !important; color:#fff !important; border-radius:50% !important; }
// .dark .react-calendar__tile--active { background:#1a1430 !important; color:#a78bfa !important; border:1px solid #4a3070; }
// .dark .react-calendar__navigation button { color:#a0a4c0; background:transparent; }
// .dark .react-calendar__navigation button:hover { background:#1e2235; color:#fff; border-radius:8px; }
// .dark .react-calendar__month-view__weekdays { color:#4a4f6a; }
// ─────────────────────────────────────────────────────────────────────────────

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
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    stage: "",
    category: "",
    deadline: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

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

  const stages = ["Todo", "In Progress", "Done"];

  const categoryColors = {
    Personal: "#a78bfa",
    Office: "#60a5fa",
    Study: "#4ade80",
    Fitness: "#fb923c",
    "Friends & Social": "#f472b6",
    Projects: "#f472b6",
    Shopping: "#facc15",
    "Events & Meetups": "#34d399",
  };

  // ── IST display helper ───────────────────────────────────────────────────────
  const formatIST = (utcDateStr) => {
    if (!utcDateStr) return "";
    return new Date(utcDateStr).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Edit prefill ─────────────────────────────────────────────────────────────
  const toISTInputValue = (utcDateStr) => {
    if (!utcDateStr) return "";
    const date = new Date(utcDateStr);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    else {
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
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setEditingTask(null);
    };
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
        const diffHours =
          (new Date(task.deadline) - new Date()) / (1000 * 60 * 60);
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
    if (!editForm.title.trim()) {
      alert("Title is required.");
      return;
    }
    setEditLoading(true);
    try {
      const res = await API.put(`/api/tasks/${editingTask._id}`, editForm);
      setTasks((prev) =>
        prev.map((t) => (t._id === editingTask._id ? res.data : t))
      );
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
    const d = new Date(task.deadline);
    return (
      d.getFullYear() === selectedDate.getFullYear() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getDate() === selectedDate.getDate()
    );
  });

  const overdueCount = tasks.filter(
    (t) => t.stage !== "Done" && t.deadline && new Date(t.deadline) < now
  ).length;

  const totalBadge = overdueCount + showNotifications.length;

  const isOverdue = (task) =>
    task.deadline && new Date(task.deadline) < now && task.stage !== "Done";
  const isDueSoon = (task) =>
    showNotifications.some((n) => n._id === task._id);

  const stageBadge = (stage) => {
    if (stage === "Done")
      return "bg-emerald-900/40 text-emerald-400 border border-emerald-800/50";
    if (stage === "In Progress")
      return "bg-amber-900/40 text-amber-400 border border-amber-800/50";
    return "bg-blue-900/40 text-blue-400 border border-blue-800/50";
  };

  return (
    <div className="min-h-screen bg-[#0d0f18] text-[#e2e4f0] flex flex-col font-sans">

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {editingTask && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTask(null);
          }}
        >
          <div className="bg-[#141622] border border-[#2a2f4a] rounded-2xl shadow-2xl w-full max-w-lg p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Task</h2>
              <button
                onClick={() => setEditingTask(null)}
                className="bg-[#1e2235] hover:bg-red-500 border border-[#2a2f4a] hover:border-red-500 text-[#6b7090] hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#7a7f9a] mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1c2e] text-[#e2e4f0] border border-[#2a2f4a] focus:outline-none focus:border-violet-500 transition text-sm placeholder:text-[#3e4260]"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7a7f9a] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1c2e] text-[#e2e4f0] border border-[#2a2f4a] focus:outline-none focus:border-violet-500 transition resize-none text-sm placeholder:text-[#3e4260]"
                  placeholder="Task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#7a7f9a] mb-1.5">
                    Stage
                  </label>
                  <select
                    value={editForm.stage}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stage: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1c2e] text-[#e2e4f0] border border-[#2a2f4a] focus:outline-none focus:border-violet-500 transition text-sm"
                  >
                    <option value="">Select stage</option>
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7a7f9a] mb-1.5">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1c2e] text-[#e2e4f0] border border-[#2a2f4a] focus:outline-none focus:border-violet-500 transition text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7a7f9a] mb-1.5">
                  Deadline (IST)
                </label>
                <input
                  type="datetime-local"
                  value={editForm.deadline}
                  onChange={(e) =>
                    setEditForm({ ...editForm, deadline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1c2e] text-[#e2e4f0] border border-[#2a2f4a] focus:outline-none focus:border-violet-500 transition text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingTask(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#1e2235] border border-[#2a2f4a] text-[#a0a4c0] font-semibold hover:bg-[#2a2f4a] transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-60 transition text-sm"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-over Sidebar ──────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#141622] border-r border-[#222640] shadow-2xl z-50 transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-0 overflow-hidden"
        }`}
      >
        <div className="p-6 min-w-[288px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Categories</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="bg-[#1e2235] hover:bg-red-500 border border-[#2a2f4a] hover:border-red-500 text-[#6b7090] hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all text-lg"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  navigate(`/dashboard/${encodeURIComponent(category)}`)
                }
                className="w-full text-left flex items-center gap-3 bg-[#1a1c2e] hover:bg-violet-600 hover:text-white text-[#a0a4c0] px-4 py-3 rounded-xl font-semibold transition duration-200 text-sm border border-[#252840] hover:border-violet-500"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: categoryColors[category] || "#a78bfa",
                  }}
                />
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#141622] border-b border-[#222640] px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-[#1e2235] hover:bg-violet-600 border border-[#2a2f4a] hover:border-violet-500 text-[#a0a4c0] hover:text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              Welcome back, {user?.name} 🚀
            </h1>
            <p className="text-xs text-[#6b7090] mt-0.5">
              Stay productive and manage tasks efficiently
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative bg-[#1e2235] hover:bg-[#2a2f4a] border border-[#2a2f4a] text-[#a0a4c0] w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {totalBadge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalBadge}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute right-0 mt-2 w-88 bg-[#141622] border border-[#2a2f4a] rounded-2xl shadow-2xl p-5 z-50 max-h-[480px] overflow-y-auto min-w-[340px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifPanel(false)}
                    className="text-[#6b7090] hover:text-white text-lg"
                  >
                    ×
                  </button>
                </div>

                {showNotifications.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
                      Due Within 24 Hours
                    </p>
                    <div className="space-y-2">
                      {showNotifications.map((task) => (
                        <div
                          key={task._id}
                          className="bg-orange-900/20 border-l-2 border-orange-500 rounded-xl p-3 flex items-start justify-between gap-2"
                        >
                          <div>
                            <p className="font-semibold text-[#e2e4f0] text-sm">
                              {task.title}
                            </p>
                            <p className="text-xs text-orange-400 mt-0.5">
                              Due: {formatIST(task.deadline)}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setShowNotifications(
                                showNotifications.filter(
                                  (n) => n._id !== task._id
                                )
                              )
                            }
                            className="text-[#6b7090] hover:text-white text-base"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {overdueCount > 0 && (
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                      Overdue Tasks
                    </p>
                    <div className="space-y-2">
                      {tasks
                        .filter(
                          (t) =>
                            t.stage !== "Done" &&
                            t.deadline &&
                            new Date(t.deadline) < now
                        )
                        .map((task) => (
                          <div
                            key={task._id}
                            className="bg-red-900/20 border-l-2 border-red-500 rounded-xl p-3"
                          >
                            <p className="font-semibold text-[#e2e4f0] text-sm">
                              {task.title}
                            </p>
                            <p className="text-xs text-red-400 mt-0.5">
                              Was due: {formatIST(task.deadline)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {totalBadge === 0 && (
                  <div className="text-center py-8 text-[#3e4260] font-semibold text-sm">
                    All caught up! No alerts.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-[#1e2235] hover:bg-[#2a2f4a] border border-[#2a2f4a] text-[#a0a4c0] px-3.5 py-2 rounded-xl font-semibold transition text-xs flex items-center gap-1.5"
          >
            {darkMode ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </>
            )}
          </button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-lg hover:scale-105 transition duration-200"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#141622] border border-[#2a2f4a] rounded-2xl shadow-2xl p-5 z-50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white text-lg font-bold flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {user?.name}
                    </h2>
                    <p className="text-xs text-[#6b7090]">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }}
                  className="w-full bg-red-500/20 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white py-2.5 rounded-xl font-semibold transition text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero Stats Bar ───────────────────────────────────────────────────── */}
      <div className="bg-[#141622] border-b border-[#222640] px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">
            Smart Productivity Dashboard
          </h2>
          <p className="text-xs text-[#6b7090] mt-0.5">
            Organize tasks, track deadlines, and stay on top of everything.
          </p>
        </div>
        <div className="flex gap-3">
          {[
            {
              label: "Total Tasks",
              count: tasks.length,
              color: "text-violet-400",
              bg: "bg-violet-900/30 border-violet-800/40",
            },
            {
              label: "Upcoming",
              count: tasks.filter(
                (t) =>
                  t.deadline &&
                  new Date(t.deadline) > now &&
                  t.stage !== "Done"
              ).length,
              color: "text-blue-400",
              bg: "bg-blue-900/30 border-blue-800/40",
            },
            {
              label: "Overdue",
              count: overdueCount,
              color: "text-red-400",
              bg: "bg-red-900/30 border-red-800/40",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} border rounded-xl px-4 py-2.5 text-center min-w-[80px]`}
            >
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-[#6b7090] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────────── */}
      <div className="flex-1 grid lg:grid-cols-2 gap-0">

        {/* ── Tasks Panel ──────────────────────────────────────────────────── */}
        <div className="border-r border-[#222640] p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Tasks</h2>
            <span className="bg-[#1e2235] text-blue-400 border border-[#2a2f4a] px-3 py-1 rounded-lg text-xs font-semibold">
              {filteredTasks.length} Tasks
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 mb-4 bg-[#1e2235] p-1 rounded-xl">
            {["All", "Upcoming", "Overdue"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTaskFilter(tab)}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-150 ${
                  taskFilter === tab
                    ? "bg-violet-600 text-white shadow"
                    : "text-[#6b7090] hover:text-[#c8d0f0]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const ov = isOverdue(task);
                const ds = isDueSoon(task);
                const isDeleting = deleteLoadingId === task._id;

                return (
                  <div
                    key={task._id}
                    className={`rounded-2xl p-4 border transition-all duration-150 ${
                      ov
                        ? "bg-red-950/30 border-red-900/50 hover:border-red-700/60"
                        : ds
                        ? "bg-orange-950/30 border-orange-900/50 hover:border-orange-700/60"
                        : "bg-[#1a1c2e] border-[#252840] hover:border-[#4a3f7a]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-[#e2e4f0] truncate">
                            {task.title}
                          </h3>
                          {ov && (
                            <span className="text-[10px] bg-red-900/50 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded font-bold">
                              Overdue
                            </span>
                          )}
                          {ds && !ov && (
                            <span className="text-[10px] bg-orange-900/50 text-orange-400 border border-orange-800/50 px-1.5 py-0.5 rounded font-bold">
                              Due Soon
                            </span>
                          )}
                        </div>
                        <p className="text-[#6b7090] mt-1 text-xs line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                      <span className="bg-violet-900/40 text-violet-300 border border-violet-800/40 px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap flex-shrink-0">
                        {task.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${stageBadge(
                            task.stage
                          )}`}
                        >
                          {task.stage}
                        </span>
                        {task.deadline && (
                          <p
                            className={`text-[10px] font-medium flex items-center gap-1 ${
                              ov ? "text-red-400" : "text-[#6b7090]"
                            }`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatIST(task.deadline)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(task)}
                          className="flex items-center gap-1 bg-blue-900/30 hover:bg-blue-900/60 border border-blue-800/40 text-blue-400 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          disabled={isDeleting}
                          className="flex items-center gap-1 bg-red-900/30 hover:bg-red-900/60 border border-red-800/40 text-red-400 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition disabled:opacity-50"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-[#3e4260] font-semibold text-sm">
                {taskFilter === "Upcoming"
                  ? "No upcoming tasks!"
                  : taskFilter === "Overdue"
                  ? "No overdue tasks!"
                  : "No tasks available"}
              </div>
            )}
          </div>
        </div>

        {/* ── Calendar Panel ───────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto">
          <h2 className="text-base font-bold text-white mb-4">
            Task Calendar
          </h2>

          {/* Calendar – react-calendar with dark overrides via global CSS */}
          <div className="rounded-2xl overflow-hidden border border-[#222640]">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="w-full border-none !bg-[#141622] !text-[#e2e4f0]"
            />
          </div>

          {/* Day tasks */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-white mb-3">
              Tasks for {selectedDate.toDateString()}
            </h3>
            <div className="space-y-2.5">
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-[#1a1c2e] border border-[#252840] rounded-xl p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#e2e4f0] truncate">
                          {task.title}
                        </h4>
                        <p className="text-[#6b7090] mt-0.5 text-xs">
                          {task.category}
                        </p>
                        {task.deadline && (
                          <p className="text-[10px] text-red-400 mt-0.5">
                            {formatIST(task.deadline)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${stageBadge(
                            task.stage
                          )}`}
                        >
                          {task.stage}
                        </span>
                        <button
                          onClick={() => openEditModal(task)}
                          className="bg-blue-900/30 hover:bg-blue-900/60 border border-blue-800/40 text-blue-400 w-7 h-7 rounded-lg flex items-center justify-center transition"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          disabled={deleteLoadingId === task._id}
                          className="bg-red-900/30 hover:bg-red-900/60 border border-red-800/40 text-red-400 w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-50"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-[#3e4260] text-sm font-semibold">
                  No Tasks For This Day
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Add Button ──────────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/dashboard/create-task")}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-pink-500 to-violet-600 hover:scale-110 transition duration-200 text-white w-14 h-14 rounded-full shadow-2xl text-3xl font-light flex items-center justify-center"
        aria-label="Add a task"
      >
        +
      </button>
    </div>
  );
}

export default Dashboard;