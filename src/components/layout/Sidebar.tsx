'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Menu,
  Receipt
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useState } from 'react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Inventory', icon: Package, href: '/dashboard/inventory' },
  { name: 'Procurement', icon: ShoppingCart, href: '/dashboard/procurement' },
  { name: 'Sales', icon: Receipt, href: '/dashboard/sales' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-gray-800 text-white rounded-md shadow-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className={clsx(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col transition-all duration-300",
          !isOpen && "hidden md:flex"
        )}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            SalonCapp
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {session?.user?.name || 'User'} ({session?.user?.role || 'Guest'})
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          {(session?.user?.role === 'ADMIN') && (
            <Link
              href="/dashboard/settings"
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                pathname === '/dashboard/settings'
                  ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
