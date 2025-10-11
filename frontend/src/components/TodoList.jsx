// src/components/TodoList.jsx

import { Button, Checkbox, List, Pagination } from "antd";
import { Edit, Trash2 } from "lucide-react"; // Import icon Lucide

export default function TodoList({
  items,
  total,
  page,
  pageSize,
  onPageChange,
  onToggle,
  onDelete,
  onEditTitle,
  onOpenModal,
}) {
  return (
    <div className="todo-list-wrapper card">
      <List
        locale={{ emptyText: "Chưa có công việc nào" }}
        dataSource={items}
        renderItem={(todo) => (
          <List.Item
            className="todo-item"
            actions={[
              <Button
                type="text"
                icon={<Edit size={18} />}
                onClick={() => onOpenModal(todo)}
                key="edit"
                className="edit-btn" // Thêm class cho nút sửa
              />,
              <Button
                type="text"
                danger
                icon={<Trash2 size={18} />}
                onClick={() => onDelete(todo._id)}
                key="delete"
                className="delete-btn" // Thêm class cho nút xóa
              />,
            ]}
          >
            <Checkbox
              checked={todo.completed}
              onChange={() => onToggle(todo._id, !todo.completed)}
            />
            <span
              className={`todo-title ${todo.completed ? "completed" : ""}`}
              style={{ flexGrow: 1, marginLeft: "10px" }}
            >
              {todo.title}
            </span>
          </List.Item>
        )}
      />
      {total > 0 && (
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger={false}
          style={{ textAlign: "right", marginTop: "1rem" }}
        />
      )}
    </div>
  );
}
