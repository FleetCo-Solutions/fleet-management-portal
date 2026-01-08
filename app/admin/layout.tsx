import { ReactNode } from "react";
import AdminSideBarNavigation from "./components/AdminSideBarNavigation";
import AdminTopNavigation from "./components/AdminTopNavigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="flex">
        <AdminSideBarNavigation />
        <div className="flex-1">
          <div>
            <AdminTopNavigation />
          </div>
          <div className="h-[93vh] overflow-auto bg-white">{children}</div>
        </div>
      </div>
    </div>
  );
}
