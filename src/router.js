import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Auth from "./components/auth/Auth";
import Dashboard from "./components/dashboard/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "auth",
        element: <Auth />,
      },
    ],
  },
]);

export default router;
