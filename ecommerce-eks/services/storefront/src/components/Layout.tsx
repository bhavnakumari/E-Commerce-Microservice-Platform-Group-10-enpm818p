import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-spotify-black">
      <Sidebar />
      <main className="ml-64 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;