import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import JobList from '../pages/jobs/JobList';
import ResumeList from '../pages/resumes/ResumeList';
import Profile from '../pages/profile/Profile';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  
  if (isAuthenticated) {
    return <Navigate to="/jobs" />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/jobs" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/jobs",
    element: (
      <PrivateRoute>
        <JobList />
      </PrivateRoute>
    ),
  },
  {
    path: "/resumes",
    element: (
      <PrivateRoute>
        <ResumeList />
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
