import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/login",
        formData
      );

      // Save token

      localStorage.setItem(
        "token",
        res.data.token
      );

      // Save user info

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Login Failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-purple-600
        via-pink-500
        to-indigo-600
        flex items-center justify-center
        p-6
      "
    >

      <div
        className="
          w-full max-w-md
          bg-white/10 backdrop-blur-xl
          border border-white/20
          shadow-2xl
          rounded-3xl
          p-10
        "
      >

        {/* Logo / Heading */}

        <div className="text-center mb-10">

          <div
            className="
              w-24 h-24 mx-auto
              rounded-full
              bg-gradient-to-r from-pink-500 to-purple-500
              flex items-center justify-center
              text-white text-4xl font-bold
              shadow-xl
            "
          >
            T
          </div>

          <h1 className="text-4xl font-bold text-white mt-6">
            Welcome Back
          </h1>

          <p className="text-white/80 mt-3">
            Login to continue managing your tasks
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          {/* Email */}

          <div>

            <label className="text-white font-semibold block mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="
                w-full
                bg-white/20
                border border-white/20
                text-white
                placeholder:text-white/60
                p-4 rounded-2xl
                outline-none
                focus:ring-2 focus:ring-white
              "
            />

          </div>

          {/* Password */}

          <div>

            <label className="text-white font-semibold block mb-2">
              Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="
                  w-full
                  bg-white/20
                  border border-white/20
                  text-white
                  placeholder:text-white/60
                  p-4 rounded-2xl
                  outline-none
                  focus:ring-2 focus:ring-white
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="
                  absolute right-4 top-1/2
                  -translate-y-1/2
                  text-white/80
                  font-semibold
                "
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-gradient-to-r
              from-pink-500
              to-purple-500
              hover:scale-105
              transition duration-300
              text-white
              py-4 rounded-2xl
              font-bold text-lg
              shadow-2xl
              disabled:opacity-70
            "
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

        {/* Divider */}

        <div className="flex items-center gap-4 my-8">

          <div className="flex-1 h-[1px] bg-white/20"></div>

          <span className="text-white/70 text-sm">
            OR
          </span>

          <div className="flex-1 h-[1px] bg-white/20"></div>

        </div>

        {/* Register */}

        <p className="text-center text-white/80">

          Don’t have an account?
          {" "}

          <Link
            to="/register"
            className="
              text-white font-bold
              hover:text-pink-200
              transition
            "
          >
            Register
          </Link>

        </p>

      </div>

    </div>

  );

}

export default Login;