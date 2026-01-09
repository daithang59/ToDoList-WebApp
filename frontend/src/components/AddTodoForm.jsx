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
  priority,
  onPriorityChange,
  templates,
  templateId,
  onTemplateSelect,
  onSaveTemplate,
}) {
  const projectOptions = Array.isArray(projects)
    ? projects.map((project) => ({
        value: project._id,
        label: project.name,
      }))
    : [];

  const templateOptions = Array.isArray(templates)
    ? templates.map((template) => ({
        value: template.id,
        label: template.name,
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
        <Button
          size="large"
          onClick={onSaveTemplate}
          disabled={!value.trim()}
        >
          Save Template
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
      <div className="add-todo-row add-todo-row-secondary">
        <Select
          value={priority}
          onChange={onPriorityChange}
          options={[
            { value: "urgent", label: "Urgent" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
          placeholder="Priority"
          className="add-priority-select"
        />
        <Select
          value={templateId || ""}
          onChange={(value) => onTemplateSelect?.(value || null)}
          options={[{ value: "", label: "No template" }, ...templateOptions]}
          placeholder="Template"
          className="add-template-select"
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
    </div>
  );
}
