import {
    AppstoreOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    ProjectOutlined,
    StarOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Menu } from "antd";
import { Pencil, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./sidebar.css";

function getItem(label, key, icon, children, type) {
  return { key, icon, children, label, type };
}

const quickFilterItems = [
  getItem("All", "filter-all", <AppstoreOutlined />),
  getItem("Today", "filter-today", <CalendarOutlined />),
  getItem("Active", "filter-active", <ClockCircleOutlined />),
  getItem("Completed", "filter-completed", <CheckCircleOutlined />),
  getItem("Important", "filter-important", <StarOutlined />),
  getItem("Overdue", "filter-overdue", <ExclamationCircleOutlined />),
];

export default function Sidebar({
  onFilterSelect,
  activeFilter,
  projects,
  activeProjectId,
  onProjectSelect,
  onProjectAdd,
  onProjectEdit,
}) {
  const { user, isGuest } = useAuth();
  const selectedFilterKey = activeFilter ? `filter-${activeFilter}` : "filter-all";
  const projectItems = [
    getItem("All Projects", "project-all", <ProjectOutlined />),
    ...(Array.isArray(projects)
      ? projects.map((project) =>
          getItem(project.name, `project-${project._id}`, <ProjectOutlined />)
        )
      : []),
  ];

  // Get user display info
  const userName = user?.name || "Guest User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = user?.email || (isGuest ? "Guest Mode" : "");

  return (
    <div className="sidebar-container">
      <div className="sidebar-menus">
        <Menu
          mode="inline"
          selectedKeys={[selectedFilterKey]}
          items={quickFilterItems}
          className="sidebar-menu"
          onClick={(info) => onFilterSelect(info.key)}
        />

        <div className="project-header">
          <span>Projects</span>
          <Button
            type="text"
            size="small"
            icon={<Plus size={16} />}
            onClick={onProjectAdd}
          />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[
            activeProjectId ? `project-${activeProjectId}` : "project-all",
          ]}
          items={projectItems}
          className="sidebar-menu"
          onClick={(info) => onProjectSelect(info.key)}
        />

        {activeProjectId && (
          <Button
            type="text"
            size="small"
            icon={<Pencil size={14} />}
            className="project-edit-btn"
            onClick={() => onProjectEdit(activeProjectId)}
          >
            Edit project
          </Button>
        )}
      </div>

      <div className="sidebar-footer">
        <Avatar size="large" className="author-avatar">
          {userInitial}
        </Avatar>
        <div className="author-details">
          <span className="author-name">{userName}</span>
          <span className="author-meta">{userEmail}</span>
        </div>
      </div>
    </div>
  );
}
