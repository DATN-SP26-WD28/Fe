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
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 shadow-sm z-50">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-base select-none">
          R
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm text-gray-800 tracking-wider">ROOSTA</span>
          <span className="text-[10px] text-red-600 font-medium">Bàn số: {tableNumber}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wide">
          Đang phục vụ
        </span>
      </div>
    </header>
  );
};

export default Header;