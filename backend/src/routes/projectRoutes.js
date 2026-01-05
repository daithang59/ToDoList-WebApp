import { Router } from "express";
import ProjectController from "../controllers/ProjectController.js";
import TodoValidation from "../middlewares/validation.js";

const router = Router();

router.get("/", ProjectController.getProjects);
router.post("/", ProjectController.createProject);
router.get(
  "/:id",
  TodoValidation.validateObjectId,
  ProjectController.getProjectById
);
router.patch(
  "/:id",
  TodoValidation.validateObjectId,
  ProjectController.updateProject
);
router.delete(
  "/:id",
  TodoValidation.validateObjectId,
  ProjectController.deleteProject
);

export default router;
