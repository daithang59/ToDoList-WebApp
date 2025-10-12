// src/components/TodoList.jsx
import { Button, List, Pagination, Tooltip, Typography } from "antd";
import { Check, Pencil, Trash2 } from "lucide-react"; // Thêm icon Pencil và Check

export default function TodoList({
  items,
  total,
  page,
  pageSize,
  onPageChange,
  onToggle,
  onDelete,
  onOpenModal, // onEditTitle không còn dùng để sửa inline
}) {
  return (
    <div className="todo-list-wrapper">
      <List
        dataSource={items}
        locale={{ emptyText: "Chưa có công việc nào" }}
        renderItem={(todo) => (
          <List.Item
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            {/* Cấu trúc layout 3 cột mới cho mỗi todo item */}
            <div className="todo-item-layout">
              {/* CỘT 1: Nút Toggle mới, nổi bật hơn */}
              <Tooltip
                title={
                  todo.completed ? "Đánh dấu chưa xong" : "Đánh dấu đã xong"
                }
              >
                <button
                  className="todo-toggle"
                  onClick={() => onToggle(todo._id, !todo.completed)}
                >
                  {/* Icon check chỉ hiện khi đã completed */}
                  {todo.completed && <Check size={16} strokeWidth={3} />}
                </button>
              </Tooltip>

              {/* CỘT 2: Nội dung chính (Tiêu đề, deadline, tag) */}
              <div className="todo-content">
                <Typography.Paragraph
                  className="todo-title"
                  style={{ marginBottom: 0 }}
                  // Tắt chế độ sửa inline, chuyển qua modal
                  editable={false}
                >
                  {todo.title}
                </Typography.Paragraph>

                <div className="sub-line">
                  {todo.deadline && (
                    <span
                      className={`deadline-chip ${new Date(todo.deadline) < new Date() && !todo.completed ? "overdue" : ""}`}
                    >
                      Hạn chót: {new Date(todo.deadline).toLocaleDateString()}
                    </span>
                  )}
                  {/* Tag "Đã xong" được làm nổi bật hơn */}
                  {todo.completed && (
                    <div className="todo-status-tag">
                      <Check size={12} strokeWidth={3} />
                      <span>Đã xong</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CỘT 3: Các nút hành động */}
              <div className="todo-actions">
                <Tooltip title="Sửa công việc">
                  <Button
                    onClick={() => onOpenModal(todo)} // Nút edit sẽ mở modal
                    size="small"
                    type="text"
                    icon={<Pencil size={16} />}
                  />
                </Tooltip>
                <Tooltip title="Xóa">
                  <Button
                    danger
                    onClick={() => onDelete(todo._id)}
                    size="small"
                    type="text"
                    icon={<Trash2 size={16} />}
                  />
                </Tooltip>
              </div>
            </div>
          </List.Item>
        )}
      />
      {total > pageSize && (
        <div className="list-footer">
          <Pagination
            current={page}
            onChange={onPageChange}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
