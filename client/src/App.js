import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Tasks from './pages/Tasks';
import Departments from './pages/Departments';
import SLATracker from './pages/SLATracker';
import AddClient from './pages/AddClient';
import Employees from './pages/Employees';
import ClientPortal from './pages/ClientPortal';
import Layout from './components/Layout';


const isLoggedIn = () => !!localStorage.getItem('token');

const Protected = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
         <Route path="/my-portal" element={<ClientPortal />} />
        <Route path="/" element={
          <Protected>
            <Layout />
          </Protected>
        }>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/add" element={<AddClient />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="departments" element={<Departments />} />
          <Route path="sla" element={<SLATracker />} />
          <Route path="employees" element={<Employees />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;