const STORAGE_KEY = "todo:templates";

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readStorage = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  return safeParse(value, fallback);
};

const writeStorage = (key, value) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const getTemplates = () => readStorage(STORAGE_KEY, []);

export const setTemplates = (templates) => {
  writeStorage(STORAGE_KEY, templates);
};

export const addTemplate = (template) => {
  const templates = getTemplates();
  templates.unshift(template);
  setTemplates(templates);
  return templates;
};

export const removeTemplate = (templateId) => {
  const templates = getTemplates();
  const next = templates.filter((template) => template.id !== templateId);
  setTemplates(next);
  return next;
};
