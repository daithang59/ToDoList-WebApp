import { Router } from "express";
import Todo from "../models/Todo.js";

const router = Router();


// GET all
router.get("/", async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (e) {
    next(e);
  }
});

// POST create
router.post("/", async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim())
      return res.status(400).json({ message: "Title is required" });
    const todo = await Todo.create({
      title: title.trim(),
      description: description || "",
    });
    res.status(201).json(todo);
  } catch (e) {
    next(e);
  }
});

// PATCH update (title/desc/completed)
router.patch("/:id", async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!todo) return res.status(404).json({ message: "Not found" });
    res.json(todo);
  } catch (e) {
    next(e);
  }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});


// PATCH /:id/toggle
router.patch("/:id/toggle", async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Not found" });
    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (e) {
    next(e);
  }
});


// GET /search?query=abc
router.get("/search", async (req, res, next) => {
  try {
    const q = req.query.query?.trim();
    if (!q) return res.json([]);
    const todos = await Todo.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (e) {
    next(e);
  }
});


// GET /filter?completed=true
router.get("/filter", async (req, res, next) => {
  try {
    const completed = req.query.completed === "true";
    const todos = await Todo.find({ completed }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (e) {
    next(e);
  }
});


// DELETE /clear/completed
router.delete("/clear/completed", async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({ completed: true });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) {
    next(e);
  }
});


// GET /due?before=2025-12-31
router.get("/due", async (req, res, next) => {
  try {
    const before = new Date(req.query.before);
    const todos = await Todo.find({ deadline: { $lte: before } });
    res.json(todos);
  } catch (e) {
    next(e);
  }
});


export default router;


