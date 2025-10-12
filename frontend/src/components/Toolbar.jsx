// src/components/Toolbar/Toolbar.jsx

import { Button, Input, Segmented, Select } from "antd";
import { CheckCircle2, History, LayoutGrid, Trash2 } from "lucide-react";

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
  query,
  onSearch,
  onClearCompleted,
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

      {/* Hàng 2: Thanh Actions (Tìm kiếm, Sắp xếp, Xóa...) */}
      <div className="toolbar-actions">
        {/* Khối bên trái: Ô tìm kiếm */}
        <Input.Search
          placeholder="Tìm kiếm công việc..."
          className="toolbar-search"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          onSearch={onSearch}
          allowClear
        />

        {/* Khối bên phải: Các tùy chọn */}
        <div className="toolbar-options">
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
              label: `${n}/trang`,
            }))}
            style={{ minWidth: 110 }}
          />
          <Button danger icon={<Trash2 size={16} />} onClick={onClearCompleted}>
            Xoá đã hoàn thành
          </Button>
        </div>
      </div>
    </div>
  );
}
