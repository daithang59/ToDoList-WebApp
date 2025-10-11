// src/components/Sidebar/Sidebar.jsx

import {
  AppstoreOutlined,
  CalendarOutlined,
  ProjectOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { Avatar, Menu } from "antd";
import "./sidebar.css";

// Hàm helper để tạo item cho Menu
function getItem(label, key, icon, children, type) {
  return { key, icon, children, label, type };
}

// Dữ liệu mẫu cho các danh mục
const projectItems = [
  getItem("Việc cá nhân", "proj-1"),
  getItem("Dự án công ty", "proj-2"),
  getItem("Kế hoạch mua nhà", "proj-3"),
];

const quickFilterItems = [
  getItem("Tất cả", "filter-all", <AppstoreOutlined />),
  getItem("Hôm nay", "filter-today", <CalendarOutlined />),
  getItem("Quan trọng", "filter-important", <StarOutlined />),
];

export default function Sidebar() {
  return (
    <div className="sidebar-container">
      <div className="sidebar-menus">
        <Menu
          mode="inline"
          defaultSelectedKeys={["filter-all"]}
          items={quickFilterItems}
          className="sidebar-menu"
        />
        <Menu
          mode="inline"
          defaultOpenKeys={["projects"]}
          items={[getItem("Dự án", "projects", <ProjectOutlined />, projectItems)]}
          className="sidebar-menu"
        />
      </div>

      {/* --- PHẦN THÔNG TIN TÁC GIẢ --- */}
      <div className="sidebar-footer">
        <Avatar size="large" className="author-avatar">
          T
        </Avatar>
        <div className="author-details">
          <span className="author-name">Huỳnh Lê Đại Thắng</span>
          <span className="author-meta">23521422 - UIT</span>
        </div>
      </div>
    </div>
  );
}