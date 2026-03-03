import React from "react";
import {
  Squares2X2Icon,
  InboxIcon,
  ChartPieIcon,
  UsersIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

type SidebarProps = {
  open: boolean;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onClose?: () => void;
};

const mainMenu = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { id: "requests", label: "Requests", path: "/requests", icon: "inbox" },
  { id: "reports", label: "Reports", path: "/reports", icon: "chart" },
  { id: "user-management", label: "User Management", path: "/user-management", icon: "users" },
  { id: "settings", label: "Settings", path: "/settings", icon: "settings" },
];

const getIcon = (iconName?: string) => {
  if (!iconName) return null;
  const iconProps = { className: "h-[18px] w-[18px]" };
  switch (iconName) {
    case "dashboard":
      return <Squares2X2Icon {...iconProps} />;
    case "inbox":
      return <InboxIcon {...iconProps} />;
    case "chart":
      return <ChartPieIcon {...iconProps} />;
    case "users":
      return <UsersIcon {...iconProps} />;
    case "settings":
      return <Cog6ToothIcon {...iconProps} />;
    default:
      return null;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  activeRoute,
  onNavigate,
  onClose,
}) => {
  const isRouteActive = (path: string) => {
    return activeRoute === path || activeRoute.startsWith(path);
  };

  return (
    <>
      {/* Dim background on mobile */}
      {onClose && (
        <div
          className={`sidebar-backdrop ${open ? "sidebar-backdrop--open" : ""}`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${open ? "sidebar--open" : "sidebar--closed"}`}
        aria-label="Navigation sidebar"
        aria-hidden={!open}
      >
        <div className="sidebar-content-wrapper">
          <div className="sidebar-content">
            {/* Main Menu */}
            <nav className="sidebar-section">
              <div className="sidebar-nav">
                {mainMenu.map((item) => {
                  const isActive = isRouteActive(item.path);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      className={`sidebar-nav-item sidebar-nav-item--main ${
                        isActive ? "sidebar-nav-item--active" : ""
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="sidebar-nav-icon">{getIcon(item.icon)}</span>
                      <span className="sidebar-nav-label">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

