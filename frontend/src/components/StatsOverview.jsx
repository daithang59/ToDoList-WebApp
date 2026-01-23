const safeNumber = (value) => (Number.isFinite(value) ? value : 0);

export default function StatsOverview({ stats, loading }) {
  const total = safeNumber(stats?.total);
  const completed = safeNumber(stats?.completed);
  const important = safeNumber(stats?.important);
  const active = safeNumber(stats?.active);
  const overdue = safeNumber(stats?.overdue);
  const inProgress = safeNumber(stats?.inProgress);
  const completedPercentage = safeNumber(stats?.completedPercentage);
  const percent = Math.min(100, Math.max(0, completedPercentage));

  const items = [
    { key: "total", label: "Total tasks", value: total },
    { key: "completed", label: "Completed", value: completed, meta: `${percent}%` },
    { key: "active", label: "Active", value: active },
    { key: "inProgress", label: "In progress", value: inProgress },
    { key: "important", label: "Important", value: important, tone: "warn" },
    { key: "overdue", label: "Overdue", value: overdue, tone: "alert" },
  ];

  return (
    <div className="stats-grid">
      {items.map((item) => (
        <div
          key={item.key}
          className={`stats-card${item.tone ? ` stats-${item.tone}` : ""}`}
        >
          <span className="stats-label">{item.label}</span>
          <div className="stats-value-row">
            <span className="stats-value">{loading ? "--" : item.value}</span>
            {!loading && item.meta && (
              <span className="stats-meta">{item.meta}</span>
            )}
          </div>
          {item.key === "completed" && (
            <div className="stats-progress">
              <span
                className="stats-progress-bar"
                style={{ width: loading ? "0%" : `${percent}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
