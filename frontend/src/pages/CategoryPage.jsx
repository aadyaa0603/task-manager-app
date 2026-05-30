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
    localStorage.getItem("theme") !== "light"
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

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const t = darkMode
    ? {
        pageBg: "#0d0f18",
        navBg: "#141622",
        navBorder: "#222640",
        cardBg: "#141622",
        cardBorder: "#222640",
        innerCard: "#1a1c2e",
        innerCardBorder: "#252840",
        inputBg: "#1a1c2e",
        inputBorder: "#2a2f4a",
        btnBg: "#1e2235",
        btnBorder: "#2a2f4a",
        textPrimary: "#e2e4f0",
        textSecondary: "#a0a4c0",
        textMuted: "#6b7090",
        textFaint: "#3e4260",
        textFainter: "#2e3250",
        overdueBg: "rgba(127,29,29,0.25)",
        overdueBorder: "rgba(127,29,29,0.5)",
        dropTarget: "rgba(109,40,217,0.08)",
        dropTargetBorder: "#7c3aed",
        dashedBorder: "#222640",
      }
    : {
        pageBg: "#f1f5f9",
        navBg: "#ffffff",
        navBorder: "#e2e8f0",
        cardBg: "#ffffff",
        cardBorder: "#e2e8f0",
        innerCard: "#f8fafc",
        innerCardBorder: "#e2e8f0",
        inputBg: "#f8fafc",
        inputBorder: "#cbd5e1",
        btnBg: "#f1f5f9",
        btnBorder: "#e2e8f0",
        textPrimary: "#0f172a",
        textSecondary: "#475569",
        textMuted: "#94a3b8",
        textFaint: "#cbd5e1",
        textFainter: "#e2e8f0",
        overdueBg: "rgba(254,226,226,0.8)",
        overdueBorder: "rgba(252,165,165,0.6)",
        dropTarget: "rgba(109,40,217,0.04)",
        dropTargetBorder: "#7c3aed",
        dashedBorder: "#e2e8f0",
      };

  // ── Display helpers ──────────────────────────────────────────────────────────
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
    if (!formData.title.trim()) { alert("Title is required."); return; }
    try {
      await API.post("/api/tasks", { ...formData, category });
      setFormData({ title: "", description: "", stage: "Todo", deadline: "" });
      fetchTasks();
    } catch (error) { console.log(error); }
  };

  const updateTask = async () => {
    if (!formData.title.trim()) { alert("Title is required."); return; }
    try {
      await API.put(`/api/tasks/${editingTask._id}`, { ...formData, category });
      setEditingTask(null);
      setFormData({ title: "", description: "", stage: "Todo", deadline: "" });
      fetchTasks();
    } catch (error) { console.log(error); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await API.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (error) { console.log(error); }
  };

  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragOver = (e, stage) => { e.preventDefault(); setDragOverStage(stage); };
  const handleDrop = async (stage) => {
    if (!draggedTask) return;
    setDragOverStage(null);
    try {
      await API.put(`/api/tasks/${draggedTask._id}`, { ...draggedTask, stage });
      fetchTasks();
    } catch (error) { console.log(error); }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setFormData({ title: "", description: "", stage: "Todo", deadline: "" });
  };

  const stageBadge = (stage) => {
    if (stage === "Done")
      return { bg: darkMode ? "rgba(6,78,59,0.4)" : "rgba(209,250,229,0.8)", color: darkMode ? "#34d399" : "#065f46", border: darkMode ? "rgba(6,78,59,0.5)" : "rgba(167,243,208,0.8)" };
    if (stage === "In Progress")
      return { bg: darkMode ? "rgba(120,53,15,0.4)" : "rgba(254,243,199,0.8)", color: darkMode ? "#fbbf24" : "#92400e", border: darkMode ? "rgba(120,53,15,0.5)" : "rgba(253,230,138,0.8)" };
    return { bg: darkMode ? "rgba(30,58,138,0.4)" : "rgba(219,234,254,0.8)", color: darkMode ? "#60a5fa" : "#1d4ed8", border: darkMode ? "rgba(30,58,138,0.5)" : "rgba(191,219,254,0.8)" };
  };

  const stageConfig = [
    { title: "Todo", accent: "#60a5fa", emptyText: "No to-do tasks yet." },
    { title: "In Progress", accent: "#f59e0b", emptyText: "Nothing in progress." },
    { title: "Done", accent: "#4ade80", emptyText: "No completed tasks yet." },
  ];

  // ── Shared input style ───────────────────────────────────────────────────────
  const inputStyle = {
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    color: t.textPrimary,
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: t.pageBg, color: t.textPrimary, fontFamily: "'Segoe UI', system-ui, sans-serif", transition: "background 0.2s, color 0.2s" }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.navBorder}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", position: "sticky", top: 0, zIndex: 40, transition: "background 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
            style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.textSecondary, width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#7c3aed"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = t.btnBg; e.currentTarget.style.color = t.textSecondary; e.currentTarget.style.borderColor = t.btnBorder; }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
            <div>
              <h1 style={{ fontSize: "15px", fontWeight: 700, color: t.textPrimary, margin: 0 }}>
                Category: {category}
              </h1>
              <p style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px", marginBottom: 0 }}>
                Manage your {category.toLowerCase()} tasks efficiently
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Task count pill */}
          <div style={{ padding: "6px 12px", borderRadius: "10px", border: `1px solid ${accentColor}40`, background: `${accentColor}18`, color: accentColor, fontSize: "12px", fontWeight: 600 }}>
            {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.textSecondary, padding: "8px 14px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.btnBorder)}
            onMouseLeave={(e) => (e.currentTarget.style.background = t.btnBg)}
          >
            {darkMode ? (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            style={{ background: "#7c3aed", color: "#fff", padding: "8px 16px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "12px", border: "none", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#7c3aed")}
          >
            Dashboard
          </button>
        </div>
      </div>

      <div style={{ padding: "24px" }}>

        {/* ── Create / Edit Form ─────────────────────────────────────────────── */}
        <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: "20px", padding: "24px", marginBottom: "24px", transition: "background 0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: t.textPrimary, margin: 0 }}>
              {editingTask ? "Update Task" : "Create Task"}
            </h2>
            {editingTask && (
              <button
                onClick={cancelEdit}
                style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.textMuted, width: "28px", height: "28px", borderRadius: "8px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = t.btnBg; e.currentTarget.style.color = t.textMuted; }}
              >×</button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <input
              type="text"
              name="title"
              placeholder="Task Title"
              value={formData.title}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
            />
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
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
            style={{ ...inputStyle, resize: "none", marginBottom: "12px", display: "block" }}
            onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
          />

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Deadline (IST)
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={editingTask ? updateTask : createTask}
              style={{ background: "#7c3aed", color: "#fff", padding: "10px 24px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", fontSize: "14px", border: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#7c3aed")}
            >
              {editingTask ? "Update Task" : "Create Task"}
            </button>
            {editingTask && (
              <button
                onClick={cancelEdit}
                style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.textSecondary, padding: "10px 24px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", fontSize: "14px", transition: "all 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.btnBorder)}
                onMouseLeave={(e) => (e.currentTarget.style.background = t.btnBg)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ── Kanban Columns ─────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {stageConfig.map((stageData) => {
            const stageTasks = tasks.filter((tk) => tk.stage === stageData.title);
            const isDropTarget = dragOverStage === stageData.title;

            return (
              <div
                key={stageData.title}
                onDragOver={(e) => handleDragOver(e, stageData.title)}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={() => handleDrop(stageData.title)}
                style={{
                  background: isDropTarget ? t.dropTarget : t.cardBg,
                  borderRadius: "20px",
                  border: `1px solid ${isDropTarget ? t.dropTargetBorder : t.cardBorder}`,
                  borderTop: `3px solid ${stageData.accent}`,
                  transition: "all 0.15s",
                }}
              >
                {/* Column header */}
                <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.cardBorder}` }}>
                  <h2 style={{ fontSize: "13px", fontWeight: 700, color: stageData.accent, margin: 0 }}>
                    {stageData.title}
                  </h2>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "8px", background: `${stageData.accent}18`, border: `1px solid ${stageData.accent}40`, color: stageData.accent }}>
                    {stageTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px", minHeight: "420px" }}>
                  {stageTasks.length > 0 ? (
                    stageTasks.map((task) => {
                      const ov = isOverdue(task);
                      const badge = stageBadge(task.stage);
                      return (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          style={{
                            borderRadius: "14px",
                            padding: "14px",
                            border: `1px solid ${ov ? "rgba(239,68,68,0.4)" : t.innerCardBorder}`,
                            background: ov ? t.overdueBg : t.innerCard,
                            cursor: "grab",
                            transition: "border-color 0.15s",
                          }}
                          onMouseEnter={(e) => { if (!ov) e.currentTarget.style.borderColor = "#4a3f7a"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = ov ? "rgba(239,68,68,0.4)" : t.innerCardBorder; }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <h3 style={{ fontSize: "13px", fontWeight: 700, color: t.textPrimary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {task.title}
                                </h3>
                                {ov && (
                                  <span style={{ fontSize: "9px", background: "rgba(127,29,29,0.4)", color: "#f87171", border: "1px solid rgba(127,29,29,0.5)", padding: "2px 5px", borderRadius: "4px", fontWeight: 700, flexShrink: 0 }}>
                                    Overdue
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <p style={{ color: t.textMuted, marginTop: "4px", marginBottom: 0, fontSize: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                  {task.description}
                                </p>
                              )}
                            </div>
                            {/* Drag dots */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px", flexShrink: 0, opacity: 0.35 }}>
                              {[0, 1, 2].map((i) => (
                                <div key={i} style={{ display: "flex", gap: "2px" }}>
                                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: t.textMuted }} />
                                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: t.textMuted }} />
                                </div>
                              ))}
                            </div>
                          </div>

                          {task.deadline && (
                            <p style={{ fontSize: "10px", fontWeight: 500, color: ov ? "#f87171" : t.textMuted, display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px", marginTop: 0 }}>
                              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatIST(task.deadline)}
                            </p>
                          )}

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "8px", background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                              {task.stage}
                            </span>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => {
                                  setEditingTask(task);
                                  setFormData({
                                    title: task.title,
                                    description: task.description,
                                    stage: task.stage,
                                    deadline: task.deadline ? toLocalInputValue(task.deadline) : "",
                                  });
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(30,58,138,0.2)", border: "1px solid rgba(30,58,138,0.35)", color: "#60a5fa", padding: "5px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(30,58,138,0.4)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(30,58,138,0.2)")}
                              >
                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTask(task._id)}
                                style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(127,29,29,0.2)", border: "1px solid rgba(127,29,29,0.35)", color: "#f87171", padding: "5px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(127,29,29,0.4)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(127,29,29,0.2)")}
                              >
                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div style={{ border: `2px dashed ${isDropTarget ? "rgba(124,58,237,0.5)" : t.dashedBorder}`, borderRadius: "12px", padding: "32px", textAlign: "center", transition: "border-color 0.15s" }}>
                      <p style={{ color: t.textFaint, fontSize: "12px", fontWeight: 500, margin: 0 }}>
                        {stageData.emptyText}
                      </p>
                      <p style={{ color: t.textFainter, fontSize: "10px", marginTop: "4px", marginBottom: 0 }}>
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