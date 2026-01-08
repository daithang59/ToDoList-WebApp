import mongoose from "mongoose";
import Todo from "../models/Todo.js";

const STATUS_VALUES = new Set(["todo", "in_progress", "done"]);
const RECURRENCE_UNITS = new Set(["day", "week", "month"]);
const REMINDER_CHANNELS = new Set(["email", "push"]);

const normalizeMemberId = (value) =>
  typeof value === "string" ? value.trim() : "";

const buildMemberFilter = (memberId) =>
  memberId
    ? { $or: [{ ownerId: memberId }, { sharedWith: memberId }] }
    : {};

const mergeFilters = (base, extra) => {
  if (!extra || Object.keys(extra).length === 0) return base;
  if (!base || Object.keys(base).length === 0) return extra;
  return { $and: [base, extra] };
};

class TodoService {
  static sanitizeTags(tags) {
    if (!Array.isArray(tags)) return [];
    const seen = new Set();
    return tags
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter(Boolean)
      .filter((tag) => {
        const key = tag.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  static sanitizeSharedWith(values) {
    if (!Array.isArray(values)) return [];
    const seen = new Set();
    return values
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean)
      .filter((value) => {
        const key = value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  static normalizeSubtasks(subtasks) {
    if (!Array.isArray(subtasks)) return [];
    return subtasks
      .map((item) => ({
        title: typeof item?.title === "string" ? item.title.trim() : "",
        completed: Boolean(item?.completed),
      }))
      .filter((item) => item.title.length > 0);
  }

  static normalizeDependencies(dependencies, currentId) {
    if (!Array.isArray(dependencies)) return [];
    const seen = new Set();
    const normalized = dependencies
      .map((id) => (typeof id === "string" ? id.trim() : id))
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .filter((id) => {
        const key = String(id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    if (currentId) {
      return normalized.filter((id) => String(id) !== String(currentId));
    }
    return normalized;
  }

  static normalizeRecurrence(recurrence) {
    if (!recurrence) return undefined;
    const enabled = Boolean(recurrence.enabled);
    const interval = Math.max(1, parseInt(recurrence.interval || 1, 10));
    const unit = RECURRENCE_UNITS.has(recurrence.unit)
      ? recurrence.unit
      : "day";
    const until = recurrence.until ? new Date(recurrence.until) : null;
    if (until && Number.isNaN(until.getTime())) {
      throw new Error("Invalid recurrence end date");
    }
    return { enabled, interval, unit, until };
  }

  static normalizeReminder(reminder) {
    if (!reminder) return undefined;
    const enabled = Boolean(reminder.enabled);
    const minutesBefore = Math.max(1, parseInt(reminder.minutesBefore || 60, 10));
    const channels = Array.isArray(reminder.channels)
      ? reminder.channels.filter((channel) => REMINDER_CHANNELS.has(channel))
      : [];
    const email = typeof reminder.email === "string" ? reminder.email.trim() : "";
    return { enabled, minutesBefore, channels, email };
  }

  static resolveStatusAndCompleted(current, updates) {
    const currentStatus =
      current?.status || (current?.completed ? "done" : "todo");
    let status = currentStatus;
    let completed = Boolean(current?.completed);

    if (updates.status !== undefined) {
      if (!STATUS_VALUES.has(updates.status)) {
        throw new Error("Invalid status value");
      }
      status = updates.status;
      completed = status === "done";
    }

    if (updates.completed !== undefined) {
      completed = Boolean(updates.completed);
      if (completed) {
        status = "done";
      } else if (status === "done") {
        status = "todo";
      }
    }

    return { status, completed };
  }

  static async ensureDependenciesExist(ids, memberId) {
    if (!ids.length) return;
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);
    const filter = mergeFilters({ _id: { $in: ids } }, memberFilter);
    const count = await Todo.countDocuments(filter);
    if (count !== ids.length) {
      throw new Error("One or more dependencies not found");
    }
  }

  static async ensureDependenciesCompleted(ids, memberId) {
    if (!ids.length) return;
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);
    const filter = mergeFilters(
      {
        _id: { $in: ids },
        completed: false,
      },
      memberFilter
    );
    const pending = await Todo.countDocuments(filter);
    if (pending > 0) {
      throw new Error("Dependencies not completed");
    }
  }

  static computeNextDeadline(deadline, recurrence) {
    const base = deadline ? new Date(deadline) : new Date();
    const next = new Date(base);
    const interval = Math.max(1, recurrence.interval || 1);

    switch (recurrence.unit) {
      case "week":
        next.setDate(next.getDate() + interval * 7);
        break;
      case "month":
        next.setMonth(next.getMonth() + interval);
        break;
      default:
        next.setDate(next.getDate() + interval);
        break;
    }

    return next;
  }

  static async createNextRecurringTodo(todo) {
    if (!todo?.recurrence?.enabled) return null;
    const nextDeadline = this.computeNextDeadline(todo.deadline, todo.recurrence);
    if (todo.recurrence.until && nextDeadline > todo.recurrence.until) {
      return null;
    }

    const resetSubtasks = Array.isArray(todo.subtasks)
      ? todo.subtasks.map((subtask) => ({
          title: subtask.title,
          completed: false,
        }))
      : [];

    const nextTodo = await Todo.create({
      title: todo.title,
      description: todo.description,
      completed: false,
      completedAt: null,
      status: "todo",
      order: todo.order,
      deadline: nextDeadline,
      important: todo.important,
      tags: todo.tags,
      subtasks: resetSubtasks,
      dependencies: todo.dependencies,
      recurrence: todo.recurrence,
      reminder: {
        ...todo.reminder,
        lastNotifiedAt: null,
      },
      projectId: todo.projectId,
      ownerId: todo.ownerId,
      sharedWith: todo.sharedWith,
    });

    return nextTodo;
  }

  static async getTodos(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      filter = {},
      memberId,
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);
    const finalFilter = mergeFilters(filter, memberFilter);

    const todos = await Todo.find(finalFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Todo.countDocuments(finalFilter);

    return {
      todos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async createTodo(todoData, memberId) {
    const ownerId = normalizeMemberId(memberId);
    if (!ownerId) {
      throw new Error("OwnerId is required");
    }
    const {
      title,
      description,
      deadline,
      important,
      tags,
      status,
      order,
      subtasks,
      dependencies,
      recurrence,
      reminder,
      projectId,
      sharedWith,
      completed,
    } = todoData;

    if (!title?.trim()) {
      throw new Error("Title is required");
    }

    let processedDeadline = null;
    if (deadline) {
      processedDeadline = new Date(deadline);
      if (Number.isNaN(processedDeadline.getTime())) {
        throw new Error("Invalid deadline format");
      }
    }

    if (status !== undefined && !STATUS_VALUES.has(status)) {
      throw new Error("Invalid status value");
    }

    const processedTags = this.sanitizeTags(tags);
    const processedSubtasks = this.normalizeSubtasks(subtasks);
    const processedDependencies = this.normalizeDependencies(dependencies);
    const processedRecurrence = this.normalizeRecurrence(recurrence);
    const processedReminder = this.normalizeReminder(reminder);
    const processedSharedWith = this.sanitizeSharedWith(sharedWith);

    if (processedDependencies.length > 0) {
      await this.ensureDependenciesExist(processedDependencies, ownerId);
    }

    let resolvedStatus = status || (completed ? "done" : "todo");
    let resolvedCompleted = resolvedStatus === "done" || Boolean(completed);
    if (resolvedCompleted) {
      resolvedStatus = "done";
    }

    if (resolvedCompleted) {
      await this.ensureDependenciesCompleted(processedDependencies, ownerId);
    }

    const todo = await Todo.create({
      title: title.trim(),
      description: description?.trim() || "",
      deadline: processedDeadline,
      important: Boolean(important),
      tags: processedTags,
      status: resolvedStatus,
      completed: resolvedCompleted,
      completedAt: resolvedCompleted ? new Date() : null,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      subtasks: processedSubtasks,
      dependencies: processedDependencies,
      recurrence: processedRecurrence,
      reminder: processedReminder,
      projectId: mongoose.Types.ObjectId.isValid(projectId) ? projectId : null,
      ownerId,
      sharedWith: processedSharedWith,
    });

    return todo;
  }

  static async updateTodo(id, updateData, memberId) {
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);
    const todo = await Todo.findOne({ _id: id, ...memberFilter });
    if (!todo) {
      throw new Error("Todo not found");
    }

    const updates = {};
    const isOwner =
      todo.ownerId && normalizedMemberId
        ? String(todo.ownerId) === normalizedMemberId
        : false;

    if (updateData.title !== undefined) {
      if (!updateData.title?.trim()) {
        throw new Error("Title cannot be empty");
      }
      updates.title = updateData.title.trim();
    }

    if (updateData.description !== undefined) {
      updates.description = updateData.description?.trim() || "";
    }

    if (updateData.deadline !== undefined) {
      if (updateData.deadline) {
        const parsed = new Date(updateData.deadline);
        if (Number.isNaN(parsed.getTime())) {
          throw new Error("Invalid deadline format");
        }
        updates.deadline = parsed;
      } else {
        updates.deadline = null;
      }
    }

    if (updateData.tags !== undefined) {
      updates.tags = this.sanitizeTags(updateData.tags);
    }

    if (updateData.subtasks !== undefined) {
      updates.subtasks = this.normalizeSubtasks(updateData.subtasks);
    }

    if (updateData.dependencies !== undefined) {
      const deps = this.normalizeDependencies(updateData.dependencies, id);
      if (deps.length > 0) {
        await this.ensureDependenciesExist(deps, normalizedMemberId);
      }
      updates.dependencies = deps;
    }

    if (updateData.recurrence !== undefined) {
      updates.recurrence = this.normalizeRecurrence(updateData.recurrence);
    }

    if (updateData.reminder !== undefined) {
      const normalized = this.normalizeReminder(updateData.reminder);
      updates.reminder = {
        ...(todo.reminder?.toObject ? todo.reminder.toObject() : todo.reminder),
        ...normalized,
      };
    }

    if (updateData.order !== undefined) {
      updates.order = Number.isFinite(Number(updateData.order))
        ? Number(updateData.order)
        : todo.order;
    }

    if (updateData.projectId !== undefined) {
      updates.projectId = mongoose.Types.ObjectId.isValid(updateData.projectId)
        ? updateData.projectId
        : null;
    }

    if (updateData.sharedWith !== undefined && isOwner) {
      updates.sharedWith = this.sanitizeSharedWith(updateData.sharedWith);
    }

    if (updateData.important !== undefined) {
      updates.important = Boolean(updateData.important);
    }

    const { status, completed } = this.resolveStatusAndCompleted(
      todo,
      updateData
    );
    updates.status = status;
    updates.completed = completed;

    const previousCompleted = todo.completed;
    if (completed && !previousCompleted) {
      updates.completedAt = new Date();
    }
    if (!completed) {
      updates.completedAt = null;
    }

    const dependenciesToCheck =
      updates.dependencies !== undefined ? updates.dependencies : todo.dependencies;
    if (completed) {
      await this.ensureDependenciesCompleted(
        dependenciesToCheck || [],
        normalizedMemberId
      );
    }

    const updatedTodo = await Todo.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!previousCompleted && updatedTodo.completed) {
      await this.createNextRecurringTodo(updatedTodo);
    }

    return updatedTodo;
  }

  static async getTodoById(id, memberId) {
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);
    const todo = await Todo.findOne({ _id: id, ...memberFilter });
    if (!todo) {
      throw new Error("Todo not found");
    }
    return todo;
  }

  static async deleteTodo(id, memberId) {
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);
    const todo = await Todo.findOne({ _id: id, ...memberFilter });
    if (!todo) {
      throw new Error("Todo not found");
    }
    if (String(todo.ownerId || "") !== normalizedMemberId) {
      const error = new Error("Not authorized to delete this todo");
      error.status = 403;
      throw error;
    }
    await Todo.deleteOne({ _id: id });
    return todo;
  }

  static async toggleCompleted(id, memberId) {
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);
    const todo = await Todo.findOne({ _id: id, ...memberFilter });
    if (!todo) {
      throw new Error("Todo not found");
    }

    const nextCompleted = !todo.completed;
    let nextStatus = todo.status || (todo.completed ? "done" : "todo");
    if (nextCompleted) {
      await this.ensureDependenciesCompleted(
        todo.dependencies || [],
        normalizedMemberId
      );
      nextStatus = "done";
    } else if (nextStatus === "done") {
      nextStatus = "todo";
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, ...memberFilter },
      {
        completed: nextCompleted,
        status: nextStatus,
        completedAt: nextCompleted ? new Date() : null,
      },
      { new: true, runValidators: true }
    );

    if (nextCompleted) {
      await this.createNextRecurringTodo(updatedTodo);
    }

    return updatedTodo;
  }

  static async toggleImportant(id, memberId) {
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);
    const todo = await Todo.findOne({ _id: id, ...memberFilter });
    if (!todo) {
      throw new Error("Todo not found");
    }

    todo.important = !todo.important;
    await todo.save();
    return todo;
  }

  static async searchTodos(query, options = {}) {
    if (!query?.trim()) {
      const page = options.page || 1;
      const limit = options.limit || 10;
      return {
        todos: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      };
    }

    const searchRegex = new RegExp(query.trim(), "i");
    const filter = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    };

    return this.getTodos({ ...options, filter });
  }

  static async filterTodos(filterOptions, paginationOptions = {}) {
    const {
      completed,
      important,
      status,
      tags,
      deadline,
      projectId,
      memberId,
    } = filterOptions;
    const filter = {};

    if (completed !== undefined) {
      filter.completed = completed;
    }

    if (important !== undefined) {
      filter.important = important;
    }

    if (status) {
      switch (status) {
        case "active":
          filter.completed = false;
          break;
        case "completed":
          filter.completed = true;
          break;
        case "important":
          filter.important = true;
          break;
        case "todo":
        case "in_progress":
        case "done":
          filter.status = status;
          break;
        default:
          break;
      }
    }

    if (tags && Array.isArray(tags) && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (deadline) {
      const { before, after } = deadline;
      filter.deadline = { $ne: null };

      if (before) {
        filter.deadline = { ...filter.deadline, $lte: new Date(before) };
      }
      if (after) {
        filter.deadline = { ...filter.deadline, $gte: new Date(after) };
      }
    }

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      filter.projectId = projectId;
    }

    return this.getTodos({ ...paginationOptions, filter, memberId });
  }

  static async clearCompleted(memberId) {
    const ownerId = normalizeMemberId(memberId);
    if (!ownerId) {
      throw new Error("OwnerId is required");
    }
    const result = await Todo.deleteMany({ completed: true, ownerId });
    return result.deletedCount;
  }

  static async getStats(memberId) {
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);
    const pipeline = [];
    if (Object.keys(memberFilter).length > 0) {
      pipeline.push({ $match: memberFilter });
    }
    pipeline.push({
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: ["$completed", 1, 0] } },
        important: { $sum: { $cond: ["$important", 1, 0] } },
        active: { $sum: { $cond: [{ $not: "$completed" }, 1, 0] } },
        withDeadline: { $sum: { $cond: [{ $ne: ["$deadline", null] }, 1, 0] } },
        inProgress: {
          $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
        },
        todo: { $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
      },
    });
    const stats = await Todo.aggregate(pipeline);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      important: 0,
      active: 0,
      withDeadline: 0,
      inProgress: 0,
      todo: 0,
      done: 0,
    };

    result.completedPercentage =
      result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0;

    return result;
  }

  static async getUpcomingTodos(days = 7, memberId) {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);

    const filter = mergeFilters(
      {
        deadline: {
          $gte: now,
          $lte: future,
        },
        completed: false,
      },
      memberFilter
    );

    const todos = await Todo.find(filter).sort({ deadline: 1 });

    return todos;
  }

  static async getOverdueTodos(memberId) {
    const now = new Date();
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);

    const filter = mergeFilters(
      {
        deadline: { $lt: now },
        completed: false,
      },
      memberFilter
    );

    const todos = await Todo.find(filter).sort({ deadline: 1 });

    return todos;
  }

  static async reorderTodos(items, memberId) {
    if (!Array.isArray(items)) {
      throw new Error("Invalid reorder payload");
    }
    const normalizedMemberId = normalizeMemberId(memberId);
    const memberFilter = buildMemberFilter(normalizedMemberId);

    const ids = items
      .map((item) => item?.id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (!ids.length) {
      return [];
    }

    const todos = await Todo.find({ _id: { $in: ids }, ...memberFilter });
    const todoMap = new Map(todos.map((todo) => [String(todo._id), todo]));
    const recurringCandidates = [];

    for (const item of items) {
      const todo = todoMap.get(String(item.id));
      if (!todo) continue;
      if (item.status && !STATUS_VALUES.has(item.status)) {
        throw new Error("Invalid status value");
      }
      if (item.status === "done") {
        await this.ensureDependenciesCompleted(
          todo.dependencies || [],
          normalizedMemberId
        );
      }
      if (item.status === "done" && !todo.completed && todo.recurrence?.enabled) {
        recurringCandidates.push(todo);
      }
    }

    const now = new Date();
    const bulkOps = items
      .filter((item) => todoMap.has(String(item.id)))
      .map((item) => {
        const todo = todoMap.get(String(item.id));
        const nextStatus = item.status || todo.status || "todo";
        const nextCompleted = nextStatus === "done";
        const update = {
          status: nextStatus,
          order: Number.isFinite(Number(item.order)) ? Number(item.order) : todo.order,
          completed: nextCompleted,
          completedAt: nextCompleted ? todo.completedAt || now : null,
        };

        return {
          updateOne: {
            filter: { _id: item.id },
            update: { $set: update },
          },
        };
      });

    if (bulkOps.length > 0) {
      await Todo.bulkWrite(bulkOps);
    }

    for (const todo of recurringCandidates) {
      await this.createNextRecurringTodo(todo);
    }

    return Todo.find({ _id: { $in: ids }, ...memberFilter });
  }
}

export default TodoService;
