// src/components/TodoList.jsx
import { Button, List, Pagination, Tooltip, Typography } from "antd";
import { Check, Pencil, Star, Trash2 } from "lucide-react";

export default function TodoList({
  items,
  total,
  page,
  pageSize,
  onPageChange,
  onToggle,
  onToggleImportant, // Nhận prop mới
  onDelete,
  onOpenModal,
}) {
  return (
    <div className="todo-list-wrapper">
      <List
        dataSource={items}
        locale={{ emptyText: "No todos yet" }}
        renderItem={(todo) => (
          <List.Item
            className={`todo-item ${todo.completed ? "completed" : ""} ${todo.important ? "important" : ""}`}
          >
            <div className="todo-item-layout">
              <Tooltip
                title={
                  todo.completed ? "Mark as incomplete" : "Mark as complete"
                }
              >
                <button
                  className="todo-toggle"
                  onClick={() => onToggle(todo._id, !todo.completed)}
                >
                  {todo.completed && <Check size={18} strokeWidth={3} />}
                </button>
              </Tooltip>

              <div className="todo-content">
                <Typography.Paragraph
                  className="todo-title"
                  style={{ marginBottom: 0 }}
                >
                  {todo.title}
                </Typography.Paragraph>

                {todo.description && (
                  <Typography.Paragraph className="todo-description">
                    {todo.description}
                  </Typography.Paragraph>
                )}

                <div className="sub-line">
                  {todo.deadline && (
                    <span
                      className={`deadline-chip ${new Date(todo.deadline) < new Date() && !todo.completed ? "overdue" : ""}`}
                    >
                      Deadline: {new Date(todo.deadline).toLocaleDateString()}
                    </span>
                  )}
                  {todo.completed && (
                    <div className="todo-status-tag">
                      <Check size={12} strokeWidth={3} />
                      <span>Done</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="todo-actions">
                {/* [THÊM MỚI] Nút ngôi sao */}
                <Tooltip
                  title={
                    todo.important
                      ? "Remove from important"
                      : "Mark as important"
                  }
                >
                  <Button
                    onClick={() => onToggleImportant(todo._id, !todo.important)}
                    size="small"
                    type="text"
                    className="important-btn"
                    icon={<Star size={16} />}
                  />
                </Tooltip>
                <Tooltip title="Edit todo">
                  <Button
                    onClick={() => onOpenModal(todo)}
                    size="small"
                    type="text"
                    icon={<Pencil size={16} />}
                  />
                </Tooltip>
                <Tooltip title="Delete">
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
