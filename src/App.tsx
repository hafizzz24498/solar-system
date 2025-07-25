import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Installations from './pages/Installations';
import Customers from './pages/Customers';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import Maintainance from './pages/Maintainance';


function App() {

  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="installations" element={<Installations />} />
        <Route path="customers" element={<Customers />} />
        <Route path="maintainance" element={<Maintainance />} />
      </Route>
    </Routes>
  );
}

export default App
