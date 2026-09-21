import React, { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useUIStore } from '../../stores/uiStore';

const CartPopover = lazy(() => 
  import('../../pages/CartPopover').then(module => ({ default: module.CartPopover }))
);

export default function MainLayout() {
 const isCartOpen = useUIStore((state) => state.UserInterfaces['cart-popover']);
 return (
    <div className="relative min-h-screen flex flex-col bg-[var(--color-bg)] overflow-x-hidden">
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[700px] lg:w-[850px] aspect-square pointer-events-none select-none z-0 flex items-center justify-center animate-neon-pulse"
      >
        <img 
          src="/icons/42.svg" 
          alt="42 Neon Logo" 
		  width="700"
		  height="700"
          className="w-full h-full object-contain neon-42"
        />
      </div>
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        {isCartOpen && (
		 <Suspense fallback={null}>
          <CartPopover />
        </Suspense>
		)}
        <main className="flex-1 bg-transparent">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}