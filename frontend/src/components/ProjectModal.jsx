import { Button, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";

const { TextArea } = Input;

export default function ProjectModal({
  open,
  project,
  onSave,
  onDelete,
  onClose,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#22c55e");
  const [sharedWith, setSharedWith] = useState([]);

  useEffect(() => {
    setName(project?.name || "");
    setDescription(project?.description || "");
    setColor(project?.color || "#22c55e");
    setSharedWith(Array.isArray(project?.sharedWith) ? project.sharedWith : []);
  }, [project]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description,
      color,
      sharedWith,
    });
  };

  return (
    <Modal
      title={project ? "Edit Project" : "New Project"}
      open={open}
      onCancel={onClose}
      footer={[
        project ? (
          <Button key="delete" danger onClick={() => onDelete(project._id)}>
            Delete
          </Button>
        ) : null,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          disabled={!name.trim()}
        >
          Save
        </Button>,
      ]}
    >
      <Input
        placeholder="Project name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        style={{ marginBottom: 12 }}
      />
      <TextArea
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        autoSize={{ minRows: 3 }}
        style={{ marginBottom: 12 }}
      />
      <Input
        type="color"
        value={color}
        onChange={(event) => setColor(event.target.value)}
        style={{ marginBottom: 12 }}
      />
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
