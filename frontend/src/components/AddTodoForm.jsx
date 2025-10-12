// src/components/AddTodoForm.jsx

import { Button, Input } from "antd";

export default function AddTodoForm({ value, onChange, onAdd, loading }) {
  return (
    <div className="add-todo-form">
      <Input
        placeholder="Add a new todo..."
        size="large"
        allowClear
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={onAdd}
      />
      <Button type="primary" size="large" onClick={onAdd} loading={loading}>
        Add
      </Button>
    </div>
  );
}
