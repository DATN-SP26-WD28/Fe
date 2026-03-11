import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SideMenu from '@/components/SideMenu'
import { Menu } from 'lucide-react'

const GuestLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="bg-brand w-full h-14 flex items-center justify-center text-white font-bold text-lg sticky top-0 z-20">
        <Menu onClick={() => setMenuOpen(true)} className="fixed top-3 left-3 z-40" />
        <h1 className='text-lg'>Roosta</h1>
      </header>

      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main>
        <Outlet />
      </main>
    </>
  )
}

export default GuestLayout