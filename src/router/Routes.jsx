import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layout/Main/Main";
import SignIn from "../Pages/Auth/SignIn/SignIn";
import ForgatePassword from "../Pages/Auth/ForgatePassword/ForgatePassword";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Dashboard from "../Pages/Dashboard/Dashboard";
import VerifyCode from "../Pages/Auth/VerifyCode/VerifyCode";
import NewPass from "../Pages/Auth/NewPass/NewPass";
import Settings from "../Pages/Settings/Settings";
import PaymentDetails from "../Pages/PaymentDetails/PaymentDetails";
import Payments from "../Pages/Payments/PaymentManagement";
import SupportCenter from "../Pages/Support/SupportCenter";
import SupportMessageDetails from "../Pages/Support/SupportMessageDetails";
import Analytics from "../Pages/Analytics/Analytics";
import UserManagement from "../Pages/UserManagement/UserManagement";
import UserDetails from "../Pages/UserManagement/UserDetails";
import EventDetails from "../Pages/UserManagement/EventDetails";
import Report from "../Pages/Support/Report";
import ReportDetails from "../Pages/Support/ReportDetails";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        path: "/forgate-password",
        element: <ForgatePassword />,
      },
      {
        path: "/verify-code",
        element: <VerifyCode />,
      },
      {
        path: "/new-password",
        element: <NewPass />,
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/analytics", element: <Analytics /> },
          { path: "/user-management", element: <UserManagement /> },
          { path: "/user-management/:id", element: <UserDetails /> },
          { path: "/event-details/:id", element: <EventDetails /> },
          { path: "/payment-management" , element: <Payments/>},
          { path: "/payment-details/:id" , element: <PaymentDetails/>},
          { path: "/support-center", element: <SupportCenter /> },
          { path: "/support-message/:id", element: <SupportMessageDetails /> },
          { path: "/report", element: <Report /> },
          { path: "/report-details/:id", element: <ReportDetails /> },
          { path: "/settings", element: <Settings/> },
        ],
      },
    ],
  },
], { basename });
