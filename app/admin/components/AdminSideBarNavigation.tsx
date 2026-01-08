'use client'
import React from 'react'
import Link from 'next/link'
import SidebarItem from '../../components/navigations/sideBarItem'
import { adminSideBarItems } from './adminSideBarItems'

const AdminSideBarNavigation = () => {
  return (
    <div className="w-[15%] bg-[#EBEBEB] h-[100vh] border-r-[1px] border-black/10">
      <div className="w-full h-[7vh] bg-[#004953] flex items-center">
        <Link
          href="/admin"
          className={`flex items-center space-x-3 mx-3 px-4 group transition-all`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 border border-white/40 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-glow">
            FC
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-white group-hover:text-primary-600 transition-colors">
              FleetCo
            </span>
          </div>
        </Link>
      </div>
      <ul className="text-black flex flex-col gap-1 my-5 font-extrabold">
        {adminSideBarItems.map((item, index) => (
          <SidebarItem
            key={index}
            route={item.route}
            itemName={item.itemName}
            itemIcon={item.itemIcon}
            subItems={('children' in item ? item.children : undefined) as any}
          />
        ))}
      </ul>
    </div>
  )
}

export default AdminSideBarNavigation