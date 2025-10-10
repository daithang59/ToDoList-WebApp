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

export default router;
