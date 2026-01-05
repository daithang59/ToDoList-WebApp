import {
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const RECURRENCE_UNITS = [
  { value: "day", label: "Day(s)" },
  { value: "week", label: "Week(s)" },
  { value: "month", label: "Month(s)" },
];

const REMINDER_CHANNELS = [
  { value: "email", label: "Email" },
  { value: "push", label: "Push" },
];

const DEFAULT_RECURRENCE = {
  enabled: false,
  interval: 1,
  unit: "day",
  until: null,
};

const DEFAULT_REMINDER = {
  enabled: false,
  minutesBefore: 60,
  channels: [],
  email: "",
};

export default function EditTodoModal({
  open,
  onClose,
  todo,
  onSave,
  projects,
  allTodos,
  onEnablePush,
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState("todo");
  const [projectId, setProjectId] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [recurrence, setRecurrence] = useState(DEFAULT_RECURRENCE);
  const [reminder, setReminder] = useState(DEFAULT_REMINDER);
  const [sharedWith, setSharedWith] = useState([]);

  useEffect(() => {
    setTitle(todo?.title || "");
    setDesc(todo?.description || "");
    setDeadline(todo?.deadline ? dayjs(todo.deadline) : null);
    setTags(Array.isArray(todo?.tags) ? todo.tags : []);
    setStatus(todo?.status || (todo?.completed ? "done" : "todo"));
    setProjectId(todo?.projectId || null);
    setSubtasks(Array.isArray(todo?.subtasks) ? todo.subtasks : []);
    setDependencies(Array.isArray(todo?.dependencies) ? todo.dependencies : []);
    setRecurrence({ ...DEFAULT_RECURRENCE, ...(todo?.recurrence || {}) });
    setReminder({ ...DEFAULT_REMINDER, ...(todo?.reminder || {}) });
    setSharedWith(Array.isArray(todo?.sharedWith) ? todo.sharedWith : []);
  }, [todo]);

  useEffect(() => {
    if (reminder.enabled && reminder.channels.includes("push")) {
      onEnablePush?.();
    }
  }, [reminder.enabled, reminder.channels, onEnablePush]);

  const projectOptions = useMemo(
    () =>
      Array.isArray(projects)
        ? projects.map((project) => ({
            value: project._id,
            label: project.name,
          }))
        : [],
    [projects]
  );

  const dependencyOptions = useMemo(
    () =>
      Array.isArray(allTodos)
        ? allTodos
            .filter((item) => item._id !== todo?._id)
            .map((item) => ({
              value: item._id,
              label: item.title,
            }))
        : [],
    [allTodos, todo]
  );

  const updateSubtask = (index, changes) => {
    setSubtasks((prev) =>
      prev.map((subtask, idx) =>
        idx === index ? { ...subtask, ...changes } : subtask
      )
    );
  };

  const addSubtask = () => {
    setSubtasks((prev) => [...prev, { title: "", completed: false }]);
  };

  const removeSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <Modal
      title="Edit Todo"
      open={open}
      onOk={() => {
        if (title.trim()) {
          onSave({
            title: title.trim(),
            description: desc,
            deadline: deadline ? deadline.toDate() : null,
            tags,
            status,
            projectId,
            subtasks,
            dependencies,
            recurrence,
            reminder,
            sharedWith,
          });
        }
      }}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
      destroyOnClose
      okButtonProps={{ disabled: !title.trim() }}
    >
      <Input
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Todo title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Select
        value={status}
        onChange={setStatus}
        options={STATUS_OPTIONS}
        style={{ width: "100%", marginBottom: 12 }}
      />
      <Select
        value={projectId || ""}
        onChange={(value) => setProjectId(value || null)}
        options={[{ value: "", label: "No project" }, ...projectOptions]}
        placeholder="Project"
        style={{ width: "100%", marginBottom: 12 }}
      />
      <DatePicker
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Deadline"
        value={deadline}
        onChange={(d) => setDeadline(d)}
      />
      <Select
        mode="tags"
        value={tags}
        onChange={(next) => setTags(next || [])}
        tokenSeparators={[","]}
        placeholder="Tags (comma-separated)"
        style={{ width: "100%", marginBottom: 12 }}
        maxTagCount="responsive"
        allowClear
      />
      <TextArea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        autoSize={{ minRows: 4 }}
        placeholder="Add description/notes..."
      />

      <Divider orientation="left">Subtasks</Divider>
      <Space direction="vertical" style={{ width: "100%" }}>
        {subtasks.map((subtask, index) => (
          <div className="subtask-row" key={`${subtask.title}-${index}`}>
            <Checkbox
              checked={subtask.completed}
              onChange={(e) =>
                updateSubtask(index, { completed: e.target.checked })
              }
            />
            <Input
              value={subtask.title}
              placeholder="Subtask title"
              onChange={(e) => updateSubtask(index, { title: e.target.value })}
            />
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              onClick={() => removeSubtask(index)}
            />
          </div>
        ))}
        <Button
          type="dashed"
          icon={<Plus size={16} />}
          onClick={addSubtask}
        >
          Add subtask
        </Button>
      </Space>

      <Divider orientation="left">Dependencies</Divider>
      <Select
        mode="multiple"
        value={dependencies}
        onChange={(next) => setDependencies(next || [])}
        options={dependencyOptions}
        placeholder="Select dependencies"
        style={{ width: "100%", marginBottom: 8 }}
        maxTagCount="responsive"
        allowClear
      />

      <Divider orientation="left">Recurrence</Divider>
      <Space align="center" wrap>
        <Switch
          checked={recurrence.enabled}
          onChange={(checked) =>
            setRecurrence((prev) => ({ ...prev, enabled: checked }))
          }
        />
        {recurrence.enabled && (
          <>
            <InputNumber
              min={1}
              value={recurrence.interval}
              onChange={(value) =>
                setRecurrence((prev) => ({
                  ...prev,
                  interval: value || 1,
                }))
              }
            />
            <Select
              value={recurrence.unit}
              onChange={(value) =>
                setRecurrence((prev) => ({ ...prev, unit: value }))
              }
              options={RECURRENCE_UNITS}
              style={{ minWidth: 140 }}
            />
            <DatePicker
              value={recurrence.until ? dayjs(recurrence.until) : null}
              onChange={(value) =>
                setRecurrence((prev) => ({
                  ...prev,
                  until: value ? value.toDate() : null,
                }))
              }
              placeholder="Repeat until"
            />
          </>
        )}
      </Space>

      <Divider orientation="left">Reminders</Divider>
      <Space align="center" wrap>
        <Switch
          checked={reminder.enabled}
          onChange={(checked) =>
            setReminder((prev) => ({ ...prev, enabled: checked }))
          }
        />
        {reminder.enabled && (
          <>
            <InputNumber
              min={1}
              value={reminder.minutesBefore}
              onChange={(value) =>
                setReminder((prev) => ({
                  ...prev,
                  minutesBefore: value || 1,
                }))
              }
            />
            <Select
              value={reminder.channels}
              onChange={(value) =>
                setReminder((prev) => ({ ...prev, channels: value || [] }))
              }
              mode="multiple"
              options={REMINDER_CHANNELS}
              placeholder="Channels"
              style={{ minWidth: 180 }}
            />
            <Input
              value={reminder.email}
              onChange={(e) =>
                setReminder((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Reminder email"
            />
          </>
        )}
      </Space>

      <Divider orientation="left">Sharing</Divider>
      <Select
        mode="tags"
        value={sharedWith}
        onChange={(next) => setSharedWith(next || [])}
        tokenSeparators={[","]}
        placeholder="Invite emails (comma-separated)"
        style={{ width: "100%" }}
        maxTagCount="responsive"
        allowClear
      />
    </Modal>
  );
}
