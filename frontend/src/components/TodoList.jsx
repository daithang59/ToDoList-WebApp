import { Button, List, Pagination, Tag, Tooltip, Typography } from "antd";
import { Check, Pencil, Star, Trash2 } from "lucide-react";

const priorityColorMap = {
  urgent: "red",
  high: "volcano",
  medium: "gold",
  low: "blue",
};

export default function TodoList({
  items,
  total,
  page,
  pageSize,
  onPageChange,
  onToggle,
  onToggleImportant,
  onDelete,
  onOpenModal,
  dependencyMap,
  projectMap,
}) {
  return (
    <div className="todo-list-wrapper">
      <List
        dataSource={items}
        rowKey={(todo) => todo._id}
        locale={{ emptyText: "No todos yet" }}
        renderItem={(todo) => {
          const isBlocked =
            Array.isArray(todo.dependencies) &&
            todo.dependencies.length > 0 &&
            dependencyMap &&
            todo.dependencies.some((id) => dependencyMap.get(id) === false);
          const totalSubtasks = Array.isArray(todo.subtasks)
            ? todo.subtasks.length
            : 0;
          const doneSubtasks = Array.isArray(todo.subtasks)
            ? todo.subtasks.filter((subtask) => subtask.completed).length
            : 0;
          const project = projectMap?.get(todo.projectId);
          const priority = todo.priority || "medium";
          const priorityColor = priorityColorMap[priority] || "default";

          return (
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

                  {Array.isArray(todo.tags) && todo.tags.length > 0 && (
                    <div className="todo-tags">
                      {todo.tags.map((tag, index) => (
                        <Tag key={`${tag}-${index}`} className="todo-tag">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}

                  <div className="sub-line">
                    {todo.deadline && (
                      <span
                        className={`deadline-chip ${new Date(todo.deadline) < new Date() && !todo.completed ? "overdue" : ""}`}
                      >
                        Deadline: {new Date(todo.deadline).toLocaleDateString()}
                      </span>
                    )}
                    {project && (
                      <Tag color={project.color || "default"}>
                        {project.name}
                      </Tag>
                    )}
                    <Tag color={priorityColor}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Tag>
                    {todo.status === "in_progress" && (
                      <Tag className="todo-status-chip">In Progress</Tag>
                    )}
                    {isBlocked && <Tag color="orange">Blocked</Tag>}
                    {totalSubtasks > 0 && (
                      <Tag className="todo-subtask-chip">
                        Subtasks: {doneSubtasks}/{totalSubtasks}
                      </Tag>
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
          );
        }}
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
