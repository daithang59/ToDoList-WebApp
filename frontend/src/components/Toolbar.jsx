import {
  AppstoreTwoTone,
  CheckCircleTwoTone,
  ClockCircleTwoTone,
} from "@ant-design/icons";
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
  return (
    <div className="control-lg w-full flex flex-col gap-3">
      <div className="w-full">
        <Segmented
          block
          size="large"
          style={{ height: 44, width: "100%" }}
          value={filter}
          onChange={(val) => onFilterChange(val)}
          options={[
            {
              label: (
                <div className="flex items-center justify-center gap-1 px-1">
                  <AppstoreTwoTone
                    twoToneColor="#7C3AED"
                    style={{ fontSize: "14px" }}
                  />
                  <span className="text-xs">Tất cả</span>
                </div>
              ),
              value: "all",
            },
            {
              label: (
                <div className="flex items-center justify-center gap-1 px-1">
                  <ClockCircleTwoTone
                    twoToneColor="#6366F1"
                    style={{ fontSize: "14px" }}
                  />
                  <span className="text-xs">Đang làm</span>
                </div>
              ),
              value: "active",
            },
            {
              label: (
                <div className="flex items-center justify-center gap-1 px-1">
                  <CheckCircleTwoTone
                    twoToneColor="#22C55E"
                    style={{ fontSize: "14px" }}
                  />
                  <span className="text-xs">Hoàn thành</span>
                </div>
              ),
              value: "completed",
            },
          ]}
        />
      </div>
      <div className="flex items-center gap-3">
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
