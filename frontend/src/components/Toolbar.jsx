// src/components/Toolbar/Toolbar.jsx

import { CheckCircle2, History, LayoutGrid } from "lucide-react";
import { Segmented, Select } from "antd";

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
];

export default function Toolbar({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
}) {
  const iconSize = 16;
  const iconStrokeWidth = 2;

  return (
    // Class mới để quản lý layout dọc
    <div className="toolbar-layout">
      <Segmented
        block
        size="large"
        value={filter}
        onChange={(val) => onFilterChange(val)}
        options={[
          {
            label: (
              // Class mới để quản lý khoảng cách giữa icon và chữ
              <div className="segmented-label">
                <LayoutGrid size={iconSize} strokeWidth={iconStrokeWidth} />
                <span>Tất cả</span>
              </div>
            ),
            value: "all",
          },
          {
            label: (
              <div className="segmented-label">
                <History size={iconSize} strokeWidth={iconStrokeWidth} />
                <span>Đang làm</span>
              </div>
            ),
            value: "active",
          },
          {
            label: (
              <div className="segmented-label">
                <CheckCircle2 size={iconSize} strokeWidth={iconStrokeWidth} />
                <span>Hoàn thành</span>
              </div>
            ),
            value: "completed",
          },
        ]}
      />
      
      {/* Nhóm các ô Select lại */}
      <div className="toolbar-actions">
        <Select
          value={sort}
          onChange={onSortChange}
          options={sortOptions}
          style={{ minWidth: 150 }}
        />
        <Select
          value={pageSize}
          onChange={onPageSizeChange}
          options={[5, 8, 10, 15].map((n) => ({
            value: n,
            label: `${n}/trang`,
          }))}
          style={{ minWidth: 130 }}
        />
      </div>
    </div>
  );
}