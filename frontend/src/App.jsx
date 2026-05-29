
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CategoryPage from "./pages/CategoryPage";
import CreateTask from "./pages/CreateTask";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard/:category"
          element={<CategoryPage />}
        />

        <Route
  path="/dashboard/create-task"
  element={<CreateTask />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;

