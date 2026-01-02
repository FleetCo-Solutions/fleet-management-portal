"use client";

import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

interface UserDropdownProps {
  userName?: string | null;
  userRole?: string | null;
}

export default function UserDropdown({
  userName,
  userRole,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex gap-3 items-center relative cursor-pointer" ref={dropdownRef}>
      <div 
        className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg py-2 px-3 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 bg-[#004953] rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {userName?.charAt(0).toUpperCase() || 'A'}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {userName || 'Admin User'}
          </div>
          <div className="text-xs text-gray-500">
            {userRole || 'Super Admin'}
          </div>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2} 
          stroke="currentColor" 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-100 md:hidden">
            <p className="font-medium text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500">{userRole}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#004953] transition-colors"
          >
            Profile
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#004953] transition-colors"
          >
            Settings
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <button
            onClick={() => signOut({callbackUrl: "/login"})}
            className="w-full text-left font-semibold px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
