import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import StaffHome from './pages/StaffHome';
import AdminHome from './pages/AdminHome';
import NotFound from './pages/NotFound';
import { ADMIN_ROLES, STAFF_ROLES } from './utils/roles';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
          <Route path="/staff" element={<StaffHome />} />
        </Route>

        <Route element={<ProtectedRoute roles={ADMIN_ROLES} />}>
          <Route path="/admin" element={<AdminHome />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}