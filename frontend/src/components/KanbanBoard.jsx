import { Button, Tag, Tooltip } from "antd";
import { Check, Pencil, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const columns = [
  { key: "todo", title: "To Do" },
  { key: "in_progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

export default function KanbanBoard({
  items,
  onMove,
  onToggleImportant,
  onDelete,
  onOpenModal,
  dependencyMap,
}) {
  const [draggingId, setDraggingId] = useState(null);

  const grouped = useMemo(() => {
    const byStatus = {
      todo: [],
      in_progress: [],
      done: [],
    };

    items.forEach((item) => {
      const status = item.status || (item.completed ? "done" : "todo");
      if (!byStatus[status]) byStatus[status] = [];
      byStatus[status].push(item);
    });

    Object.keys(byStatus).forEach((status) => {
      byStatus[status].sort((a, b) => {
        const orderA = Number.isFinite(a.order) ? a.order : 0;
        const orderB = Number.isFinite(b.order) ? b.order : 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });

    return byStatus;
  }, [items]);

  const handleDragStart = (event, id) => {
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDrop = (event, status, index) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    if (!id) return;
    onMove(id, status, index);
    setDraggingId(null);
  };

  return (
    <div className="kanban-board">
      {columns.map((column) => {
        const columnItems = grouped[column.key] || [];
        return (
          <div
            key={column.key}
            className="kanban-column"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, column.key, columnItems.length)}
          >
            <div className="kanban-column-header">
              <span>{column.title}</span>
              <Tag>{columnItems.length}</Tag>
            </div>

            <div className="kanban-column-body">
              {columnItems.map((todo, index) => {
                const isBlocked =
                  Array.isArray(todo.dependencies) &&
                  todo.dependencies.length > 0 &&
                  dependencyMap &&
                  todo.dependencies.some(
                    (id) => dependencyMap.get(id) === false
                  );
                const totalSubtasks = Array.isArray(todo.subtasks)
                  ? todo.subtasks.length
                  : 0;
                const doneSubtasks = Array.isArray(todo.subtasks)
                  ? todo.subtasks.filter((subtask) => subtask.completed).length
                  : 0;

                return (
                  <div
                    key={todo._id}
                    className={`kanban-card ${draggingId === todo._id ? "dragging" : ""}`}
                    draggable
                    onDragStart={(event) => handleDragStart(event, todo._id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, column.key, index)}
                  >
                    <div className="kanban-card-title">{todo.title}</div>

                    {todo.deadline && (
                      <div className="kanban-card-meta">
                        Due: {new Date(todo.deadline).toLocaleDateString()}
                      </div>
                    )}

                    {Array.isArray(todo.tags) && todo.tags.length > 0 && (
                      <div className="kanban-card-tags">
                        {todo.tags.map((tag, tagIndex) => (
                          <Tag key={`${todo._id}-tag-${tagIndex}`}>{tag}</Tag>
                        ))}
                      </div>
                    )}

                    <div className="kanban-card-flags">
                      {isBlocked && <Tag color="warning">Blocked</Tag>}
                      {totalSubtasks > 0 && (
                        <Tag>
                          Subtasks: {doneSubtasks}/{totalSubtasks}
                        </Tag>
                      )}
                      {todo.completed && (
                        <Tag color="success">
                          <Check size={12} /> Done
                        </Tag>
                      )}
                    </div>

                    <div className="kanban-card-actions">
                      <Tooltip
                        title={
                          todo.important
                            ? "Remove from important"
                            : "Mark as important"
                        }
                      >
                        <Button
                          onClick={() =>
                            onToggleImportant(todo._id, !todo.important)
                          }
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
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
