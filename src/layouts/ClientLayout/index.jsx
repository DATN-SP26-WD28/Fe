import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const ClientLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <Header />

      <main className="flex-1 overflow-y-auto pb-24 bg-[#f8f8f8]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default ClientLayout;