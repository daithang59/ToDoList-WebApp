// src/components/AddTodoForm.jsx

import { Button, Input, Select } from "antd";

export default function AddTodoForm({
  value,
  onChange,
  onAdd,
  loading,
  tags,
  onTagsChange,
  projects,
  projectId,
  onProjectChange,
}) {
  const projectOptions = Array.isArray(projects)
    ? projects.map((project) => ({
        value: project._id,
        label: project.name,
      }))
    : [];

  return (
    <div className="add-todo-form">
      <div className="add-todo-row">
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
      <Select
        mode="tags"
        value={tags}
        onChange={(next) => onTagsChange(next || [])}
        tokenSeparators={[","]}
        placeholder="Tags (comma-separated)"
        className="add-tags-select"
        maxTagCount="responsive"
        allowClear
      />
      <Select
        value={projectId || ""}
        onChange={(value) => onProjectChange(value || null)}
        options={[
          { value: "", label: "No project" },
          ...projectOptions,
        ]}
        placeholder="Project"
        className="add-project-select"
      />
    </div>
  );
}
