// src/components/Sidebar/Sidebar.jsx

import {
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ProjectOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { Avatar, Menu } from "antd";
import "./sidebar.css";

function getItem(label, key, icon, children, type) {
  return { key, icon, children, label, type };
}

const projectItems = [
  getItem("Personal Tasks", "proj-1"),
  getItem("Work Project", "proj-2"),
  getItem("House Buying Plan", "proj-3"),
];

const quickFilterItems = [
  getItem("All", "filter-all", <AppstoreOutlined />),
  getItem("Today", "filter-today", <CalendarOutlined />),
  getItem("Active", "filter-active", <ClockCircleOutlined />),
  getItem("Completed", "filter-completed", <CheckCircleOutlined />),
  getItem("Important", "filter-important", <StarOutlined />),
  getItem("Overdue", "filter-overdue", <ExclamationCircleOutlined />),
];

export default function Sidebar({ onMenuItemClick, activeFilter }) {
  const selectedKey = activeFilter ? `filter-${activeFilter}` : "filter-all";

  return (
    <div className="sidebar-container">
      <div className="sidebar-menus">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={quickFilterItems}
          className="sidebar-menu"
          onClick={onMenuItemClick}
        />
        <Menu
          mode="inline"
          defaultOpenKeys={["projects"]}
          items={[
            getItem("Projects", "projects", <ProjectOutlined />, projectItems),
          ]}
          className="sidebar-menu"
          onClick={onMenuItemClick}
        />
      </div>

      <div className="sidebar-footer">
        {/* --- BỌC AVATAR TRONG THẺ <a> ĐỂ GẮN LINK --- */}
        <a
          href="https://www.facebook.com/hldaithangg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Avatar size="large" className="author-avatar">
            T
          </Avatar>
        </a>
        <div className="author-details">
          <span className="author-name">Huynh Le Dai Thang</span>
          <span className="author-meta">23521422 - UIT</span>
        </div>
      </div>
    </div>
  );
}
