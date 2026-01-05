// src/components/Toolbar/Toolbar.jsx

import { Button, Input, Segmented, Select } from "antd";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Columns,
  History,
  LayoutGrid,
  List,
  Star,
  Trash2,
} from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export default function Toolbar({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  query,
  onSearch,
  onClearCompleted,
  clearDisabled,
  viewMode,
  onViewModeChange,
}) {
  const iconSize = 16;
  const iconStrokeWidth = 2;

  return (
    <div className="toolbar-layout">
      {/* Hàng 1: Thanh Filter */}
      <Segmented
        block
        size="large"
        value={filter}
        onChange={onFilterChange}
        options={[
          {
            label: (
              <div className="segmented-label">
                <LayoutGrid size={iconSize} strokeWidth={iconStrokeWidth} />
                <span>All</span>
              </div>
            ),
            value: "all",
          },
          {
            label: (
              <div className="segmented-label">
                <Calendar size={iconSize} strokeWidth={iconStrokeWidth} />
                <span>Today</span>
              </div>
            ),
            value: "today",
          },
          {
            label: (
              <div className="segmented-label">
                <History size={iconSize} strokeWidth={iconStrokeWidth} />
                <span>Active</span>
              </div>
            ),
            value: "active",
          },
          {
            label: (
              <div className="segmented-label">
                <CheckCircle2 size={iconSize} strokeWidth={iconStrokeWidth} />
                <span>Completed</span>
              </div>
            ),
            value: "completed",
          },
          {
            label: (
              <div className="segmented-label">
                <Star size={iconSize} strokeWidth={iconStrokeWidth} />
                <span>Important</span>
              </div>
            ),
            value: "important",
          },
          {
            label: (
              <div className="segmented-label">
                <AlertTriangle size={iconSize} strokeWidth={iconStrokeWidth} />
                <span>Overdue</span>
              </div>
            ),
            value: "overdue",
          },
        ]}
      />

      {/* Hàng 2: Thanh Actions (Tìm kiếm, Sắp xếp, Xóa...) */}
      <div className="toolbar-actions">
        {/* Khối bên trái: Ô tìm kiếm */}
        <Input.Search
          placeholder="Search todos..."
          className="toolbar-search"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          onSearch={onSearch}
          allowClear
        />

        {/* Khối bên phải: Các tùy chọn */}
        <div className="toolbar-options">
          <Segmented
            value={viewMode}
            onChange={onViewModeChange}
            className="view-toggle"
            options={[
              {
                label: (
                  <div className="segmented-label">
                    <List size={iconSize} strokeWidth={iconStrokeWidth} />
                    <span>List</span>
                  </div>
                ),
                value: "list",
              },
              {
                label: (
                  <div className="segmented-label">
                    <Columns size={iconSize} strokeWidth={iconStrokeWidth} />
                    <span>Kanban</span>
                  </div>
                ),
                value: "kanban",
              },
              {
                label: (
                  <div className="segmented-label">
                    <Calendar size={iconSize} strokeWidth={iconStrokeWidth} />
                    <span>Calendar</span>
                  </div>
                ),
                value: "calendar",
              },
            ]}
          />
          <Select
            value={sort}
            onChange={onSortChange}
            options={sortOptions}
            style={{ minWidth: 120 }}
          />
          <Select
            value={pageSize}
            onChange={onPageSizeChange}
            options={[5, 8, 10, 15].map((n) => ({
              value: n,
              label: `${n}/page`,
            }))}
            style={{ minWidth: 110 }}
          />
          <Button
            danger
            icon={<Trash2 size={16} />}
            onClick={onClearCompleted}
            disabled={clearDisabled}
          >
            Clear Completed
          </Button>
        </div>
      </div>
    </div>
  );
}
