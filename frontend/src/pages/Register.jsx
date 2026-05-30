import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/api/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name",     label: "Full Name", type: "text",     placeholder: "Your full name" },
    { name: "email",    label: "Email",     type: "email",    placeholder: "you@example.com" },
    { name: "password", label: "Password",  type: "password", placeholder: "Min. 8 characters" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          min-height: 100vh;
          background-color: #0e1a12;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── Left panel ── */
        .reg-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 56px;
          background: #0e1a12;
          overflow: hidden;
        }

        .reg-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 10% 80%, rgba(105,167,90,.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 10%, rgba(212,183,120,.10) 0%, transparent 70%);
          pointer-events: none;
        }

        .reg-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #c8d5b9;
          letter-spacing: .12em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reg-logo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #69a75a;
        }

        .reg-tagline {
          position: relative;
          z-index: 1;
        }

        .reg-tagline h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.6rem, 4vw, 3.8rem);
          font-weight: 900;
          line-height: 1.08;
          color: #e8ead4;
          margin-bottom: 24px;
        }

        .reg-tagline h2 em {
          font-style: italic;
          color: #69a75a;
        }

        .reg-tagline p {
          font-size: .95rem;
          color: #7a8c70;
          line-height: 1.7;
          max-width: 320px;
          font-weight: 300;
        }

        .reg-features {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .reg-feat {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: .85rem;
          color: #6b7d61;
          font-weight: 400;
        }

        .reg-feat-icon {
          width: 30px;
          height: 30px;
          border: 1px solid #2a3d25;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: .8rem;
          color: #69a75a;
          flex-shrink: 0;
        }

        /* ── Right panel ── */
        .reg-right {
          background: #f5f0e8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 52px 48px;
          position: relative;
        }

        .reg-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #69a75a, #a3c467, #d4b778);
        }

        .reg-card {
          width: 100%;
          max-width: 420px;
        }

        .reg-card-header {
          margin-bottom: 40px;
        }

        .reg-card-header .step {
          font-size: .72rem;
          font-weight: 500;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: #69a75a;
          margin-bottom: 12px;
        }

        .reg-card-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 900;
          color: #1a2415;
          line-height: 1.1;
          margin-bottom: 8px;
        }

        .reg-card-header p {
          font-size: .88rem;
          color: #8a9680;
          font-weight: 300;
        }

        /* ── Fields ── */
        .reg-field {
          margin-bottom: 22px;
        }

        .reg-field label {
          display: block;
          font-size: .78rem;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #3d4f35;
          margin-bottom: 8px;
        }

        .reg-input-wrap {
          position: relative;
        }

        .reg-input {
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

        .reg-input::placeholder { color: #bbb8ae; }

        .reg-input:focus {
          border-color: #69a75a;
          box-shadow: 0 0 0 3px rgba(105,167,90,.12);
        }

        .reg-input.has-toggle { padding-right: 70px; }

        .reg-toggle {
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

        /* ── Submit ── */
        .reg-submit {
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
          margin-top: 8px;
          letter-spacing: .03em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .reg-submit:hover:not(:disabled) {
          background: #2c3d25;
          transform: translateY(-1px);
        }

        .reg-submit:disabled { opacity: .6; cursor: not-allowed; }

        .reg-submit .arrow {
          font-size: 1rem;
          transition: transform .2s;
        }

        .reg-submit:hover:not(:disabled) .arrow { transform: translateX(4px); }

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
        .reg-footer {
          text-align: center;
          margin-top: 28px;
          font-size: .85rem;
          color: #8a9680;
        }

        .reg-footer a {
          color: #1a2415;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1.5px solid #69a75a;
          padding-bottom: 1px;
        }

        .reg-footer a:hover { color: #69a75a; }

        /* ── Divider ── */
        .reg-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 26px 0;
          color: #c8c4ba;
          font-size: .78rem;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .reg-divider::before,
        .reg-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e0dbd0;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .reg-root { grid-template-columns: 1fr; }
          .reg-left { display: none; }
          .reg-right { padding: 40px 28px; }
        }
      `}</style>

      <div className="reg-root">

        {/* Left — Brand panel */}
        <div className="reg-left">
          <div className="reg-logo">
            <span className="reg-logo-dot" />
            Taskr
          </div>

          <div className="reg-tagline">
            <h2>
              Focus on what<br />
              <em>matters most.</em>
            </h2>
            <p>
              A calm, structured workspace for people who think deeply and work intentionally.
            </p>
          </div>

          <div className="reg-features">
            {[
              { icon: "✦", text: "Smart task prioritisation" },
              { icon: "◎", text: "Clean, distraction-free UI" }
             
            ].map((f) => (
              <div className="reg-feat" key={f.text}>
                <div className="reg-feat-icon">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form panel */}
        <div className="reg-right">
          <div className="reg-card">

            <div className="reg-card-header">
              <div className="step">Step 1 of 1</div>
              <h1>Create account</h1>
              <p>Takes less than a minute. No credit card needed.</p>
            </div>

            <form onSubmit={handleRegister}>
              {fields.map(({ name, label, type, placeholder }) => (
                <div className="reg-field" key={name}>
                  <label htmlFor={name}>{label}</label>
                  <div className="reg-input-wrap">
                    <input
                      id={name}
                      className={`reg-input${name === "password" ? " has-toggle" : ""}`}
                      type={name === "password" ? (showPassword ? "text" : "password") : type}
                      name={name}
                      placeholder={placeholder}
                      value={formData[name]}
                      onChange={handleChange}
                      onFocus={() => setFocused(name)}
                      onBlur={() => setFocused("")}
                      required
                      autoComplete={
                        name === "password" ? "new-password" :
                        name === "email"    ? "email" : "name"
                      }
                    />
                    {name === "password" && (
                      <button
                        type="button"
                        className="reg-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button type="submit" className="reg-submit" disabled={loading}>
                {loading ? (
                  <><div className="spinner" /> Creating account…</>
                ) : (
                  <>Get started <span className="arrow">→</span></>
                )}
              </button>
            </form>

            <div className="reg-footer">
              Already have an account?{" "}
              <Link to="/">Sign in</Link>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}

export default Register;