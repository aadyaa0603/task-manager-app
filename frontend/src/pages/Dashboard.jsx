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
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") !== "light"
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

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const t = darkMode
    ? {
        pageBg: "#0d0f18",
        navBg: "#141622",
        navBorder: "#222640",
        cardBg: "#1a1c2e",
        cardBorder: "#252840",
        cardHover: "#4a3f7a",
        inputBg: "#1a1c2e",
        inputBorder: "#2a2f4a",
        btnBg: "#1e2235",
        btnBorder: "#2a2f4a",
        btnBorderHover: "#4a4f7a",
        panelBg: "#141622",
        panelBorder: "#2a2f4a",
        textPrimary: "#e2e4f0",
        textSecondary: "#a0a4c0",
        textMuted: "#6b7090",
        textFaint: "#3e4260",
        sidebarBg: "#141622",
        sidebarBorder: "#222640",
        sidebarItem: "#1a1c2e",
        sidebarItemBorder: "#252840",
        statTotal: { bg: "rgba(109,40,217,0.18)", border: "rgba(109,40,217,0.3)", text: "#a78bfa" },
        statUpcoming: { bg: "rgba(37,99,235,0.18)", border: "rgba(37,99,235,0.3)", text: "#60a5fa" },
        statOverdue: { bg: "rgba(220,38,38,0.18)", border: "rgba(220,38,38,0.3)", text: "#f87171" },
        overdueBg: "rgba(127,29,29,0.25)",
        overdueBorder: "rgba(127,29,29,0.5)",
        dueSoonBg: "rgba(120,53,15,0.25)",
        dueSoonBorder: "rgba(120,53,15,0.5)",
        calBg: "#141622",
        calBorder: "#222640",
      }
    : {
        pageBg: "#f1f5f9",
        navBg: "#ffffff",
        navBorder: "#e2e8f0",
        cardBg: "#ffffff",
        cardBorder: "#e2e8f0",
        cardHover: "#c7d2fe",
        inputBg: "#f8fafc",
        inputBorder: "#cbd5e1",
        btnBg: "#f1f5f9",
        btnBorder: "#e2e8f0",
        btnBorderHover: "#94a3b8",
        panelBg: "#ffffff",
        panelBorder: "#e2e8f0",
        textPrimary: "#0f172a",
        textSecondary: "#475569",
        textMuted: "#94a3b8",
        textFaint: "#cbd5e1",
        sidebarBg: "#ffffff",
        sidebarBorder: "#e2e8f0",
        sidebarItem: "#f8fafc",
        sidebarItemBorder: "#e2e8f0",
        statTotal: { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", text: "#7c3aed" },
        statUpcoming: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", text: "#2563eb" },
        statOverdue: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "#dc2626" },
        overdueBg: "rgba(254,226,226,0.8)",
        overdueBorder: "rgba(252,165,165,0.6)",
        dueSoonBg: "rgba(255,237,213,0.8)",
        dueSoonBorder: "rgba(253,186,116,0.6)",
        calBg: "#ffffff",
        calBorder: "#e2e8f0",
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
      return {
        bg: darkMode ? "rgba(6,78,59,0.4)" : "rgba(209,250,229,0.8)",
        color: darkMode ? "#34d399" : "#065f46",
        border: darkMode ? "rgba(6,78,59,0.5)" : "rgba(167,243,208,0.8)",
      };
    if (stage === "In Progress")
      return {
        bg: darkMode ? "rgba(120,53,15,0.4)" : "rgba(254,243,199,0.8)",
        color: darkMode ? "#fbbf24" : "#92400e",
        border: darkMode ? "rgba(120,53,15,0.5)" : "rgba(253,230,138,0.8)",
      };
    return {
      bg: darkMode ? "rgba(30,58,138,0.4)" : "rgba(219,234,254,0.8)",
      color: darkMode ? "#60a5fa" : "#1d4ed8",
      border: darkMode ? "rgba(30,58,138,0.5)" : "rgba(191,219,254,0.8)",
    };
  };

  // ── Inline style helpers ─────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    background: t.inputBg,
    color: t.textPrimary,
    border: `1px solid ${t.inputBorder}`,
    outline: "none",
    fontSize: "14px",
    transition: "border-color 0.15s",
  };

  const calendarStyle = `
    .themed-cal { background: ${t.calBg} !important; border: none !important; color: ${t.textPrimary} !important; width: 100% !important; font-family: inherit !important; }
    .themed-cal .react-calendar__tile { color: ${t.textSecondary} !important; background: transparent !important; border-radius: 8px !important; padding: 8px 4px !important; }
    .themed-cal .react-calendar__tile:hover { background: ${darkMode ? "#1e2235" : "#f1f5f9"} !important; color: ${t.textPrimary} !important; }
    .themed-cal .react-calendar__tile--now { background: #7c3aed !important; color: #fff !important; border-radius: 50% !important; }
    .themed-cal .react-calendar__tile--active { background: ${darkMode ? "#1a1430" : "#ede9fe"} !important; color: ${darkMode ? "#a78bfa" : "#6d28d9"} !important; border: 1px solid ${darkMode ? "#4a3070" : "#c4b5fd"} !important; }
    .themed-cal .react-calendar__navigation button { color: ${t.textSecondary} !important; background: transparent !important; font-weight: 700 !important; }
    .themed-cal .react-calendar__navigation button:hover { background: ${darkMode ? "#1e2235" : "#f1f5f9"} !important; color: ${t.textPrimary} !important; border-radius: 8px !important; }
    .themed-cal .react-calendar__month-view__weekdays { color: ${t.textMuted} !important; font-size: 11px !important; }
    .themed-cal .react-calendar__month-view__weekdays abbr { text-decoration: none !important; }
  `;

  return (
    <div style={{ minHeight: "100vh", background: t.pageBg, color: t.textPrimary, display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', system-ui, sans-serif", transition: "background 0.2s, color 0.2s" }}>

      {/* Calendar theme injection */}
      <style>{calendarStyle}</style>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {editingTask && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTask(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
        >
          <div style={{ background: t.panelBg, border: `1px solid ${t.panelBorder}`, borderRadius: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.4)", width: "100%", maxWidth: "500px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: t.textPrimary, margin: 0 }}>Edit Task</h2>
              <button
                onClick={() => setEditingTask(null)}
                style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.textMuted, width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = t.btnBg; e.currentTarget.style.color = t.textMuted; }}
              >×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Task title"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Task description"
                  style={{ ...inputStyle, resize: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Stage</label>
                  <select
                    value={editForm.stage}
                    onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                    onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
                  >
                    <option value="">Select stage</option>
                    {stages.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                    onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline (IST)</label>
                <input
                  type="datetime-local"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => setEditingTask(null)}
                style={{ flex: 1, padding: "10px", borderRadius: "12px", background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.textSecondary, fontWeight: 600, cursor: "pointer", fontSize: "14px", transition: "all 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.btnBorder)}
                onMouseLeave={(e) => (e.currentTarget.style.background = t.btnBg)}
              >Cancel</button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                style={{ flex: 1, padding: "10px", borderRadius: "12px", background: "#7c3aed", border: "none", color: "#fff", fontWeight: 600, cursor: editLoading ? "not-allowed" : "pointer", fontSize: "14px", opacity: editLoading ? 0.6 : 1, transition: "all 0.15s" }}
                onMouseEnter={(e) => { if (!editLoading) e.currentTarget.style.background = "#6d28d9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#7c3aed"; }}
              >{editLoading ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar overlay ─────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.4)" }} />
      )}

      {/* ── Slide-over Sidebar ──────────────────────────────────────────────── */}
      <div style={{ position: "fixed", top: 0, left: 0, height: "100%", background: t.sidebarBg, borderRight: `1px solid ${t.sidebarBorder}`, boxShadow: "4px 0 24px rgba(0,0,0,0.2)", zIndex: 50, width: sidebarOpen ? "288px" : "0", overflow: "hidden", transition: "width 0.3s ease" }}>
        <div style={{ padding: "24px", minWidth: "288px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: t.textPrimary, margin: 0 }}>Categories</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.textMuted, width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = t.btnBg; e.currentTarget.style.color = t.textMuted; }}
            >×</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => navigate(`/dashboard/${encodeURIComponent(category)}`)}
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", background: t.sidebarItem, border: `1px solid ${t.sidebarItemBorder}`, color: t.textSecondary, padding: "12px 16px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", fontSize: "14px", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#7c3aed"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = t.sidebarItem; e.currentTarget.style.color = t.textSecondary; e.currentTarget.style.borderColor = t.sidebarItemBorder; }}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: categoryColors[category] || "#a78bfa", flexShrink: 0 }} />
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.navBorder}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", position: "sticky", top: 0, zIndex: 40, transition: "background 0.2s, border-color 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.textSecondary, width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#7c3aed"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = t.btnBg; e.currentTarget.style.color = t.textSecondary; e.currentTarget.style.borderColor = t.btnBorder; }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: "15px", fontWeight: 700, color: t.textPrimary, margin: 0 }}>
              Welcome back, {user?.name} 🚀
            </h1>
            <p style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px", marginBottom: 0 }}>
              Stay productive and manage tasks efficiently
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

          {/* Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              style={{ position: "relative", background: t.btnBg, border: `1px solid ${t.btnBorder}`, color: t.textSecondary, width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.btnBorder)}
              onMouseLeave={(e) => (e.currentTarget.style.background = t.btnBg)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {totalBadge > 0 && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "#fff", fontSize: "9px", fontWeight: 700, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {totalBadge}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div style={{ position: "absolute", right: 0, marginTop: "8px", width: "340px", background: t.panelBg, border: `1px solid ${t.panelBorder}`, borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.25)", padding: "20px", zIndex: 50, maxHeight: "480px", overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: t.textPrimary, margin: 0 }}>Notifications</h3>
                  <button onClick={() => setShowNotifPanel(false)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: "18px" }}>×</button>
                </div>

                {showNotifications.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#fb923c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Due Within 24 Hours</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {showNotifications.map((task) => (
                        <div key={task._id} style={{ background: "rgba(120,53,15,0.15)", borderLeft: "2px solid #f97316", borderRadius: "10px", padding: "12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                          <div>
                            <p style={{ fontWeight: 600, color: t.textPrimary, fontSize: "13px", margin: 0 }}>{task.title}</p>
                            <p style={{ fontSize: "11px", color: "#fb923c", marginTop: "2px", marginBottom: 0 }}>Due: {formatIST(task.deadline)}</p>
                          </div>
                          <button onClick={() => setShowNotifications(showNotifications.filter((n) => n._id !== task._id))} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: "16px" }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {overdueCount > 0 && (
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Overdue Tasks</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {tasks.filter((t) => t.stage !== "Done" && t.deadline && new Date(t.deadline) < now).map((task) => (
                        <div key={task._id} style={{ background: "rgba(127,29,29,0.15)", borderLeft: "2px solid #ef4444", borderRadius: "10px", padding: "12px" }}>
                          <p style={{ fontWeight: 600, color: t.textPrimary, fontSize: "13px", margin: 0 }}>{task.title}</p>
                          <p style={{ fontSize: "11px", color: "#f87171", marginTop: "2px", marginBottom: 0 }}>Was due: {formatIST(task.deadline)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalBadge === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: t.textFaint, fontWeight: 600, fontSize: "13px" }}>
                    All caught up! No alerts.
                  </div>
                )}
              </div>
            )}
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

          {/* Profile */}
          <div style={{ position: "relative" }} ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #ec4899, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(124,58,237,0.4)", transition: "transform 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>

            {showProfileMenu && (
              <div style={{ position: "absolute", right: 0, marginTop: "8px", width: "256px", background: t.panelBg, border: `1px solid ${t.panelBorder}`, borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.25)", padding: "20px", zIndex: 50 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #ec4899, #7c3aed)", color: "#fff", fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "14px", fontWeight: 700, color: t.textPrimary, margin: 0 }}>{user?.name}</h2>
                    <p style={{ fontSize: "12px", color: t.textMuted, margin: 0 }}>{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/"; }}
                  style={{ width: "100%", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "10px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "13px", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#f87171"; }}
                >Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero Stats Bar ───────────────────────────────────────────────────── */}
      <div style={{ background: t.navBg, borderBottom: `1px solid ${t.navBorder}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", transition: "background 0.2s" }}>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: t.textPrimary, margin: 0 }}>Smart Productivity Dashboard</h2>
          <p style={{ fontSize: "11px", color: t.textMuted, marginTop: "2px", marginBottom: 0 }}>
            Organize tasks, track deadlines, and stay on top of everything.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {[
            { label: "Total Tasks", count: tasks.length, s: t.statTotal },
            { label: "Upcoming", count: tasks.filter((t) => t.deadline && new Date(t.deadline) > now && t.stage !== "Done").length, s: t.statUpcoming },
            { label: "Overdue", count: overdueCount, s: t.statOverdue },
          ].map((st) => (
            <div key={st.label} style={{ background: st.s.bg, border: `1px solid ${st.s.border}`, borderRadius: "12px", padding: "10px 16px", textAlign: "center", minWidth: "80px" }}>
              <p style={{ fontSize: "20px", fontWeight: 700, color: st.s.text, margin: 0 }}>{st.count}</p>
              <p style={{ fontSize: "10px", color: t.textMuted, marginTop: "2px", marginBottom: 0 }}>{st.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>

        {/* ── Tasks Panel ──────────────────────────────────────────────────── */}
        <div style={{ borderRight: `1px solid ${t.navBorder}`, padding: "24px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: t.textPrimary, margin: 0 }}>Tasks</h2>
            <span style={{ background: t.btnBg, color: "#60a5fa", border: `1px solid ${t.btnBorder}`, padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 600 }}>
              {filteredTasks.length} Tasks
            </span>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: t.btnBg, padding: "4px", borderRadius: "12px" }}>
            {["All", "Upcoming", "Overdue"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTaskFilter(tab)}
                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", fontWeight: 600, fontSize: "12px", cursor: "pointer", border: "none", background: taskFilter === tab ? "#7c3aed" : "transparent", color: taskFilter === tab ? "#fff" : t.textMuted, transition: "all 0.15s" }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const ov = isOverdue(task);
                const ds = isDueSoon(task);
                const isDeleting = deleteLoadingId === task._id;
                const badge = stageBadge(task.stage);

                return (
                  <div
                    key={task._id}
                    style={{ borderRadius: "16px", padding: "16px", border: `1px solid ${ov ? "rgba(239,68,68,0.4)" : ds ? "rgba(249,115,22,0.4)" : t.cardBorder}`, background: ov ? t.overdueBg : ds ? t.dueSoonBg : t.cardBg, transition: "border-color 0.15s" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <h3 style={{ fontSize: "13px", fontWeight: 700, color: t.textPrimary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</h3>
                          {ov && <span style={{ fontSize: "10px", background: "rgba(127,29,29,0.4)", color: "#f87171", border: "1px solid rgba(127,29,29,0.5)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>Overdue</span>}
                          {ds && !ov && <span style={{ fontSize: "10px", background: "rgba(120,53,15,0.4)", color: "#fb923c", border: "1px solid rgba(120,53,15,0.5)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>Due Soon</span>}
                        </div>
                        <p style={{ color: t.textMuted, marginTop: "4px", marginBottom: 0, fontSize: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{task.description}</p>
                      </div>
                      <span style={{ background: "rgba(109,40,217,0.2)", color: "#a78bfa", border: "1px solid rgba(109,40,217,0.3)", padding: "2px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{task.category}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", gap: "8px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: "2px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: 600 }}>{task.stage}</span>
                        {task.deadline && (
                          <p style={{ fontSize: "10px", fontWeight: 500, color: ov ? "#f87171" : t.textMuted, margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {formatIST(task.deadline)}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => openEditModal(task)}
                          style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(30,58,138,0.2)", border: "1px solid rgba(30,58,138,0.35)", color: "#60a5fa", padding: "6px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(30,58,138,0.4)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(30,58,138,0.2)")}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          disabled={isDeleting}
                          style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(127,29,29,0.2)", border: "1px solid rgba(127,29,29,0.35)", color: "#f87171", padding: "6px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.5 : 1, transition: "all 0.15s" }}
                          onMouseEnter={(e) => { if (!isDeleting) e.currentTarget.style.background = "rgba(127,29,29,0.4)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(127,29,29,0.2)"; }}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "64px 0", color: t.textFaint, fontWeight: 600, fontSize: "14px" }}>
                {taskFilter === "Upcoming" ? "No upcoming tasks!" : taskFilter === "Overdue" ? "No overdue tasks!" : "No tasks available"}
              </div>
            )}
          </div>
        </div>

        {/* ── Calendar Panel ───────────────────────────────────────────────── */}
        <div style={{ padding: "24px", overflowY: "auto" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: t.textPrimary, marginBottom: "16px", marginTop: 0 }}>Task Calendar</h2>

          <div style={{ borderRadius: "16px", overflow: "hidden", border: `1px solid ${t.calBorder}` }}>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="themed-cal"
            />
          </div>

          <div style={{ marginTop: "24px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: t.textPrimary, marginBottom: "12px", marginTop: 0 }}>
              Tasks for {selectedDate.toDateString()}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((task) => {
                  const badge = stageBadge(task.stage);
                  return (
                    <div key={task._id} style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: "12px", padding: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: "13px", fontWeight: 700, color: t.textPrimary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</h4>
                          <p style={{ color: t.textMuted, marginTop: "2px", marginBottom: 0, fontSize: "11px" }}>{task.category}</p>
                          {task.deadline && <p style={{ fontSize: "10px", color: "#f87171", marginTop: "2px", marginBottom: 0 }}>{formatIST(task.deadline)}</p>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                          <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: "2px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: 600 }}>{task.stage}</span>
                          <button
                            onClick={() => openEditModal(task)}
                            style={{ background: "rgba(30,58,138,0.2)", border: "1px solid rgba(30,58,138,0.35)", color: "#60a5fa", width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(30,58,138,0.4)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(30,58,138,0.2)")}
                          >
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            disabled={deleteLoadingId === task._id}
                            style={{ background: "rgba(127,29,29,0.2)", border: "1px solid rgba(127,29,29,0.35)", color: "#f87171", width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: deleteLoadingId === task._id ? "not-allowed" : "pointer", opacity: deleteLoadingId === task._id ? 0.5 : 1, transition: "all 0.15s" }}
                            onMouseEnter={(e) => { if (deleteLoadingId !== task._id) e.currentTarget.style.background = "rgba(127,29,29,0.4)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(127,29,29,0.2)"; }}
                          >
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: t.textFaint, fontSize: "13px", fontWeight: 600 }}>
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
        aria-label="Add a task"
        style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 50, background: "linear-gradient(135deg, #ec4899, #7c3aed)", color: "#fff", width: "56px", height: "56px", borderRadius: "50%", border: "none", boxShadow: "0 8px 24px rgba(124,58,237,0.5)", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >+</button>
    </div>
  );
}

export default Dashboard;