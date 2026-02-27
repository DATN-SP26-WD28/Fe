import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const Header = () => {
  const [searchParams] = useSearchParams();
  const [tableNumber, setTableNumber] = useState(localStorage.getItem('roosta_table') || '??');

  useEffect(() => {
    const tableFromUrl = searchParams.get('table');
    if (tableFromUrl) {
      localStorage.setItem('roosta_table', tableFromUrl);
      setTableNumber(tableFromUrl);
    }
  }, [searchParams]);

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">R</div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-800 leading-none">ROOSTA</span>
          <span className="text-[10px] text-red-600 font-medium">Bàn số: {tableNumber}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
        <span className="text-[10px] font-bold text-gray-600 uppercase">Đang phục vụ</span>
      </div>
    </header>
  );
};

export default Header;