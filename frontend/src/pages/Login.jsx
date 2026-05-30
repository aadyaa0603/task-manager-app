import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background-color: #0e1a12;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── Left — Form panel ── */
        .login-left {
          background: #f5f0e8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 52px 48px;
          position: relative;
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #69a75a, #a3c467, #d4b778);
        }

        .login-card {
          width: 100%;
          max-width: 420px;
        }

        .login-card-header {
          margin-bottom: 40px;
        }

        .login-card-header .eyebrow {
          font-size: .72rem;
          font-weight: 500;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: #69a75a;
          margin-bottom: 12px;
        }

        .login-card-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 900;
          color: #1a2415;
          line-height: 1.1;
          margin-bottom: 8px;
        }

        .login-card-header p {
          font-size: .88rem;
          color: #8a9680;
          font-weight: 300;
        }

        /* ── Fields ── */
        .login-field {
          margin-bottom: 22px;
        }

        .login-field label {
          display: block;
          font-size: .78rem;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #3d4f35;
          margin-bottom: 8px;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input {
          width: 100%;
          padding: 14px 16px;
          background: #fff;
          border: 1.5px solid #ddd8cc;
          border-radius: 10px;
          font-size: .95rem;
          font-family: 'DM Sans', sans-serif;
          color: #1a2415;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          -webkit-appearance: none;
        }

        .login-input::placeholder { color: #bbb8ae; }

        .login-input:focus {
          border-color: #69a75a;
          box-shadow: 0 0 0 3px rgba(105,167,90,.12);
        }

        .login-input.has-toggle { padding-right: 70px; }

        .login-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: .75rem;
          font-weight: 600;
          letter-spacing: .05em;
          text-transform: uppercase;
          color: #69a75a;
          font-family: 'DM Sans', sans-serif;
          padding: 4px 6px;
        }

        .login-forgot {
          display: block;
          text-align: right;
          font-size: .78rem;
          color: #8a9680;
          text-decoration: none;
          margin-top: -14px;
          margin-bottom: 26px;
        }

        .login-forgot:hover { color: #69a75a; }

        /* ── Submit ── */
        .login-submit {
          width: 100%;
          padding: 15px;
          background: #1a2415;
          color: #e8ead4;
          border: none;
          border-radius: 10px;
          font-size: .95rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background .2s, transform .15s;
          letter-spacing: .03em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .login-submit:hover:not(:disabled) {
          background: #2c3d25;
          transform: translateY(-1px);
        }

        .login-submit:disabled { opacity: .6; cursor: not-allowed; }

        .login-submit .arrow {
          font-size: 1rem;
          transition: transform .2s;
        }

        .login-submit:hover:not(:disabled) .arrow { transform: translateX(4px); }

        /* ── Spinner ── */
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(232,234,212,.3);
          border-top-color: #e8ead4;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Footer ── */
        .login-footer {
          text-align: center;
          margin-top: 28px;
          font-size: .85rem;
          color: #8a9680;
        }

        .login-footer a {
          color: #1a2415;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1.5px solid #69a75a;
          padding-bottom: 1px;
        }

        .login-footer a:hover { color: #69a75a; }

        /* ── Right — Brand panel ── */
        .login-right {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 56px;
          background: #0e1a12;
          overflow: hidden;
        }

        .login-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 90% 80%, rgba(105,167,90,.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 10%, rgba(212,183,120,.10) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #c8d5b9;
          letter-spacing: .12em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
          align-self: flex-end;
        }

        .login-logo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #69a75a;
        }

        .login-tagline {
          position: relative;
          z-index: 1;
        }

        .login-tagline h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.6rem, 4vw, 3.8rem);
          font-weight: 900;
          line-height: 1.08;
          color: #e8ead4;
          margin-bottom: 24px;
        }

        .login-tagline h2 em {
          font-style: italic;
          color: #69a75a;
        }

        .login-tagline p {
          font-size: .95rem;
          color: #7a8c70;
          line-height: 1.7;
          max-width: 320px;
          font-weight: 300;
        }

        .login-stats {
          display: flex;
          gap: 36px;
          position: relative;
          z-index: 1;
        }

        .login-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .login-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 900;
          color: #c8d5b9;
          line-height: 1;
        }

        .login-stat-label {
          font-size: .75rem;
          color: #4d6045;
          text-transform: uppercase;
          letter-spacing: .1em;
          font-weight: 400;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-right { display: none; }
          .login-left { padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">

        {/* Left — Form panel */}
        <div className="login-left">
          <div className="login-card">

            <div className="login-card-header">
              <div className="eyebrow">Welcome back</div>
              <h1>Sign in</h1>
              <p>Pick up right where you left off.</p>
            </div>

            <form onSubmit={handleLogin}>

              <div className="login-field">
                <label htmlFor="email">Email</label>
                <div className="login-input-wrap">
                  <input
                    id="email"
                    className="login-input"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <div className="login-input-wrap">
                  <input
                    id="password"
                    className="login-input has-toggle"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <a href="#" className="login-forgot">Forgot password?</a>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <><div className="spinner" /> Signing in…</>
                ) : (
                  <>Sign in <span className="arrow">→</span></>
                )}
              </button>

            </form>

            <div className="login-footer">
              No account yet?{" "}
              <Link to="/register">Create one</Link>
            </div>

          </div>
        </div>

        {/* Right — Brand panel */}
        <div className="login-right">
          <div className="login-logo">
            Taskr
            <span className="login-logo-dot" />
          </div>

          <div className="login-tagline">
            <h2>
              Your work,<br />
              <em>finally organised.</em>
            </h2>
            <p>
              Everything you need to stay on top of your tasks — no noise, no clutter, just clarity.
            </p>
          </div>

          <div className="login-stats">
            {[
              { num: "12k+", label: "Active users" },
              { num: "98%",  label: "Uptime" },
              { num: "4.9★", label: "Rating" },
            ].map((s) => (
              <div className="login-stat" key={s.label}>
                <span className="login-stat-num">{s.num}</span>
                <span className="login-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

export default Login;