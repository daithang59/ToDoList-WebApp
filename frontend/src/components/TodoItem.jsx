import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Input, Tooltip } from "antd";
import { useState } from "react";

export default function TodoItem({
  item,
  onToggle,
  onDelete,
  onEditTitle,
  onOpenModal,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const saving = false; // có thể truyền prop nếu cần hiển thị loading riêng

  function startEdit() {
    setTitleDraft(item.title);
    setIsEditing(true);
  }
  async function saveEdit() {
    const t = titleDraft.trim();
    if (!t) return;
    await onEditTitle(t);
    setIsEditing(false);
  }

  return (
    <div className="w-full card p-4 item-hover">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Checkbox
            checked={item.completed}
            onChange={(e) => onToggle(e.target.checked)}
          />
          {isEditing ? (
            <div className="flex items-center gap-2 min-w-0">
              <Input
                size="middle"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onPressEnter={saveEdit}
                autoFocus
                className="min-w-[220px] max-w-full"
              />
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={saveEdit}
              />
              <Button
                icon={<CloseOutlined />}
                onClick={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`text-[15px] truncate ${item.completed ? "line-through text-slate-400" : "text-slate-800"}`}
              >
                {item.title}
              </span>
              {item.completed && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  Done
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
          <Tooltip title="Ghi chú">
            <Button
              size="small"
              type="text"
              icon={<FileTextOutlined />}
              onClick={onOpenModal}
            />
          </Tooltip>
          <Tooltip title="Sửa tiêu đề">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={startEdit}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <Button
              size="small"
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={onDelete}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
