import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/register",
        formData
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Registration Failed"
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
          shadow-2xl rounded-3xl
          p-10
        "
      >

        <div className="text-center mb-10">

          <div
            className="
              w-24 h-24 mx-auto
              rounded-full
              bg-gradient-to-r from-pink-500 to-purple-500
              flex items-center justify-center
              text-white text-4xl font-bold
            "
          >
            T
          </div>

          <h1 className="text-4xl font-bold text-white mt-6">
            Create Account
          </h1>

          <p className="text-white/80 mt-3">
            Start organizing your productivity
          </p>

        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-6"
        >

          {/* Name */}

          <div>

            <label className="text-white font-semibold block mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
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
                  text-white/80 font-semibold
                "
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

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
            "
          >

            {loading
              ? "Creating Account..."
              : "Register"}

          </button>

        </form>

        <p className="text-center text-white/80 mt-8">

          Already have an account?
          {" "}

          <Link
            to="/"
            className="font-bold hover:text-pink-200"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  );

}

export default Register;