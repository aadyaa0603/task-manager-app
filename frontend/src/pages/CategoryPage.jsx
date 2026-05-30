import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stage: "Todo",
    deadline: "",
  });

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

  const accentColor = categoryColors[category] || "#a78bfa";

  // ── Display helper ───────────────────────────────────────────────────────────
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

  const toLocalInputValue = (utcDateStr) => {
    if (!utcDateStr) return "";
    const date = new Date(utcDateStr);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const isOverdue = (task) =>
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.stage !== "Done";

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    else fetchTasks();
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

  // ── API calls ────────────────────────────────────────────────────────────────
  const fetchTasks = async () => {
    try {
      const res = await API.get("/api/tasks");
      setTasks(res.data.filter((task) => task.category === category));
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createTask = async () => {
    if (!formData.title.trim()) {
      alert("Title is required.");
      return;
    }
    try {
      await API.post("/api/tasks", { ...formData, category });
      setFormData({ title: "", description: "", stage: "Todo", deadline: "" });
      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const updateTask = async () => {
    if (!formData.title.trim()) {
      alert("Title is required.");
      return;
    }
    try {
      await API.put(`/api/tasks/${editingTask._id}`, { ...formData, category });
      setEditingTask(null);
      setFormData({ title: "", description: "", stage: "Todo", deadline: "" });
      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await API.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragOver = (e, stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };
  const handleDrop = async (stage) => {
    if (!draggedTask) return;
    setDragOverStage(null);
    try {
      await API.put(`/api/tasks/${draggedTask._id}`, { ...draggedTask, stage });
      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setFormData({ title: "", description: "", stage: "Todo", deadline: "" });
  };

  const stageBadge = (stage) => {
    if (stage === "Done")
      return "bg-emerald-900/40 text-emerald-400 border border-emerald-800/50";
    if (stage === "In Progress")
      return "bg-amber-900/40 text-amber-400 border border-amber-800/50";
    return "bg-blue-900/40 text-blue-400 border border-blue-800/50";
  };

  const stageConfig = [
    {
      title: "Todo",
      accent: "#60a5fa",
      emptyText: "No to-do tasks yet.",
    },
    {
      title: "In Progress",
      accent: "#f59e0b",
      emptyText: "Nothing in progress.",
    },
    {
      title: "Done",
      accent: "#4ade80",
      emptyText: "No completed tasks yet.",
    },
  ];

  const totalTasks = tasks.length;

  return (
    <div className="min-h-screen bg-[#0d0f18] text-[#e2e4f0] font-sans">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#141622] border-b border-[#222640] px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#1e2235] hover:bg-violet-600 border border-[#2a2f4a] hover:border-violet-500 text-[#a0a4c0] hover:text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
            aria-label="Back to dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: accentColor }}
            />
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                Category: {category}
              </h1>
              <p className="text-xs text-[#6b7090] mt-0.5">
                Manage your {category.toLowerCase()} tasks efficiently
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Task count pill */}
          <div
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
            style={{
              background: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor,
            }}
          >
            {totalTasks}pt indicator
          </div>

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

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl font-semibold transition text-xs"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="p-6">

        {/* ── Create / Edit Form ─────────────────────────────────────────────── */}
        <div className="bg-[#141622] border border-[#222640] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">
              {editingTask ? "Update Task" : "Create Task"}
            </h2>
            {editingTask && (
              <button
                onClick={cancelEdit}
                className="bg-[#1e2235] hover:bg-red-500 border border-[#2a2f4a] hover:border-red-500 text-[#6b7090] hover:text-white w-7 h-7 rounded-lg flex items-center justify-center transition-all text-base"
              >
                ×
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              name="title"
              placeholder="Task Title"
              value={formData.title}
              onChange={handleChange}
              className="bg-[#1a1c2e] border border-[#2a2f4a] text-[#e2e4f0] placeholder:text-[#3e4260] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 transition text-sm"
            />
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="bg-[#1a1c2e] border border-[#2a2f4a] text-[#e2e4f0] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 transition text-sm"
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
            rows={3}
            className="w-full bg-[#1a1c2e] border border-[#2a2f4a] text-[#e2e4f0] placeholder:text-[#3e4260] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 transition resize-none text-sm mb-3"
          />

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#7a7f9a] mb-1.5">
              Deadline (IST)
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full bg-[#1a1c2e] border border-[#2a2f4a] text-[#e2e4f0] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 transition text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={editingTask ? updateTask : createTask}
              className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold transition text-sm"
            >
              {editingTask ? "Update Task" : "Create Task"}
            </button>
            {editingTask && (
              <button
                onClick={cancelEdit}
                className="bg-[#1e2235] hover:bg-[#2a2f4a] border border-[#2a2f4a] text-[#a0a4c0] px-6 py-2.5 rounded-xl font-semibold transition text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ── Kanban Columns ─────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {stageConfig.map((stageData) => {
            const stageTasks = tasks.filter((t) => t.stage === stageData.title);
            const isDropTarget = dragOverStage === stageData.title;

            return (
              <div
                key={stageData.title}
                onDragOver={(e) => handleDragOver(e, stageData.title)}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={() => handleDrop(stageData.title)}
                className={`bg-[#141622] rounded-2xl border transition-all duration-150 ${
                  isDropTarget
                    ? "border-violet-500 bg-violet-900/10"
                    : "border-[#222640]"
                }`}
                style={{ borderTopWidth: "3px", borderTopColor: stageData.accent }}
              >
                {/* Column header */}
                <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#222640]">
                  <h2
                    className="text-sm font-bold"
                    style={{ color: stageData.accent }}
                  >
                    {stageData.title}
                  </h2>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-lg border"
                    style={{
                      background: `${stageData.accent}18`,
                      borderColor: `${stageData.accent}40`,
                      color: stageData.accent,
                    }}
                  >
                    {stageTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="p-3 space-y-2.5 min-h-[420px]">
                  {stageTasks.length > 0 ? (
                    stageTasks.map((task) => {
                      const ov = isOverdue(task);
                      return (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          className={`rounded-xl p-3.5 border cursor-grab active:cursor-grabbing transition-all duration-150 hover:border-[#4a3f7a] ${
                            ov
                              ? "bg-red-950/30 border-red-900/50"
                              : "bg-[#1a1c2e] border-[#252840]"
                          }`}
                        >
                          {/* Drag handle hint */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-sm font-bold text-[#e2e4f0] truncate">
                                  {task.title}
                                </h3>
                                {ov && (
                                  <span className="text-[9px] bg-red-900/50 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                                    Overdue
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-[#6b7090] mt-1 text-xs line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            {/* Drag dots */}
                            <div className="flex flex-col gap-0.5 mt-1 flex-shrink-0 opacity-40">
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="flex gap-0.5">
                                  <div className="w-1 h-1 rounded-full bg-[#6b7090]" />
                                  <div className="w-1 h-1 rounded-full bg-[#6b7090]" />
                                </div>
                              ))}
                            </div>
                          </div>

                          {task.deadline && (
                            <p
                              className={`text-[10px] font-medium flex items-center gap-1 mb-2.5 ${
                                ov ? "text-red-400" : "text-[#6b7090]"
                              }`}
                            >
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatIST(task.deadline)}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${stageBadge(task.stage)}`}>
                              {task.stage}
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingTask(task);
                                  setFormData({
                                    title: task.title,
                                    description: task.description,
                                    stage: task.stage,
                                    deadline: task.deadline
                                      ? toLocalInputValue(task.deadline)
                                      : "",
                                  });
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="bg-blue-900/30 hover:bg-blue-900/60 border border-blue-800/40 text-blue-400 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTask(task._id)}
                                className="bg-red-900/30 hover:bg-red-900/60 border border-red-800/40 text-red-400 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-150 ${
                        isDropTarget ? "border-violet-500/50" : "border-[#222640]"
                      }`}
                    >
                      <p className="text-[#3e4260] text-xs font-medium">
                        {stageData.emptyText}
                      </p>
                      <p className="text-[#2e3250] text-[10px] mt-1">
                        Drag a task here or create one above.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;