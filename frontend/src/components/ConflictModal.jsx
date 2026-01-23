import { Button, List, Modal, Space, Tag, Typography } from "antd";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "Unknown time";

const buildChangeSummary = (payload) => {
  if (!payload || typeof payload !== "object") return "No local changes";
  const keys = Object.keys(payload).filter((key) => key !== "clientUpdatedAt");
  if (!keys.length) return "No local changes";
  return keys.join(", ");
};

export default function ConflictModal({
  open,
  conflicts,
  onUseServer,
  onReapplyLocal,
  onClose,
}) {
  return (
    <Modal
      title="Sync Conflicts"
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      <List
        dataSource={conflicts}
        locale={{ emptyText: "No conflicts" }}
        renderItem={(conflict) => {
          const serverTitle = conflict.server?.title || conflict.id || "Unknown";
          const serverUpdatedAt = formatDate(conflict.server?.updatedAt);
          const changes = buildChangeSummary(conflict.payload);
          const canReapply = conflict.action === "update" && conflict.server;

          return (
            <List.Item
              actions={[
                <Button key="server" onClick={() => onUseServer(conflict.conflictId)}>
                  Use Server
                </Button>,
                <Button
                  key="local"
                  type="primary"
                  disabled={!canReapply}
                  onClick={() => onReapplyLocal(conflict)}
                >
                  Reapply Local
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Tag color="red">{conflict.action}</Tag>
                    <Typography.Text>{serverTitle}</Typography.Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={2}>
                    <Typography.Text type="secondary">
                      Server updated: {serverUpdatedAt}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      Local changes: {changes}
                    </Typography.Text>
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    </Modal>
  );
}
