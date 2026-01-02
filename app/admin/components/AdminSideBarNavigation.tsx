'use client'
import React from 'react'
import LogOutBtn from '../../components/navigations/logOutBtn'
import SidebarItem from '../../components/navigations/sideBarItem'
import { adminSideBarItems } from './adminSideBarItems'

const AdminSideBarNavigation = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={`w-[15%] bg-[#EBEBEB] h-full border-r-[1px] border-black/10`}>
      <ul className={`text-black flex flex-col gap-1 py-5 font-extrabold transition-all duration-300 ${
  collapsed ? "items-center" : "items-stretch"
}`}>
        {adminSideBarItems.map((item, index) => (
          <SidebarItem
            key={index}
            route={item.route}
            itemName={item.itemName}
            itemIcon={item.itemIcon}
            subItems={item.children}
            isCollapsed={collapsed}
          />
        ))}
      </ul>
      {/* <div className="text-black flex flex-col gap-1 my-5 font-extrabold">
        <LogOutBtn />
      </div> */}
    </div>
  )
}

export default AdminSideBarNavigation