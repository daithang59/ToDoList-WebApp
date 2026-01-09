import { beforeEach, describe, expect, it } from "vitest";
import {
  addTemplate,
  getTemplates,
  removeTemplate,
  setTemplates,
} from "./templateService";

describe("templateService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds and reads templates", () => {
    const template = {
      id: "tpl-1",
      name: "Daily Review",
      title: "Daily review",
      tags: ["work"],
      priority: "medium",
      projectId: null,
    };
    addTemplate(template);
    const templates = getTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0].name).toBe("Daily Review");
  });

  it("removes templates", () => {
    const template = {
      id: "tpl-2",
      name: "Weekly Cleanup",
      title: "Cleanup tasks",
      tags: [],
      priority: "low",
      projectId: null,
    };
    setTemplates([template]);
    const next = removeTemplate("tpl-2");
    expect(next).toHaveLength(0);
  });
});
