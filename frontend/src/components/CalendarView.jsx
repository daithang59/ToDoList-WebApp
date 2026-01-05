import { Badge, Calendar, List } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

const statusForTodo = (todo) => {
  if (todo.completed) return "success";
  if (todo.deadline && new Date(todo.deadline) < new Date()) return "error";
  return "processing";
};

export default function CalendarView({ items, onOpenModal }) {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const todosByDate = useMemo(() => {
    const map = new Map();
    items.forEach((todo) => {
      if (!todo.deadline) return;
      const key = dayjs(todo.deadline).format("YYYY-MM-DD");
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(todo);
    });
    return map;
  }, [items]);

  const getListData = (value) => {
    const key = value.format("YYYY-MM-DD");
    return todosByDate.get(key) || [];
  };

  const selectedTodos = useMemo(
    () => getListData(selectedDate),
    [selectedDate, todosByDate]
  );

  return (
    <div className="calendar-view">
      <Calendar
        value={selectedDate}
        onSelect={(value) => setSelectedDate(value)}
        cellRender={(value) => {
          const list = getListData(value);
          if (!list.length) return null;
          return (
            <ul className="calendar-cell">
              {list.slice(0, 3).map((todo) => (
                <li key={todo._id}>
                  <Badge status={statusForTodo(todo)} text={todo.title} />
                </li>
              ))}
              {list.length > 3 && (
                <li className="calendar-more">+{list.length - 3} more</li>
              )}
            </ul>
          );
        }}
      />

      <div className="calendar-panel card">
        <h3>
          Tasks on {selectedDate.format("MMM D, YYYY")}
        </h3>
        <List
          dataSource={selectedTodos}
          locale={{ emptyText: "No tasks for this date" }}
          renderItem={(todo) => (
            <List.Item onClick={() => onOpenModal(todo)} className="calendar-item">
              <List.Item.Meta
                title={todo.title}
                description={todo.description || "No description"}
              />
              <Badge status={statusForTodo(todo)} />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
