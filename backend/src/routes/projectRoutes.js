import { Router } from "express";
import ProjectController from "../controllers/ProjectController.js";
import ProjectValidation from "../middlewares/projectValidation.js";
import TodoValidation from "../middlewares/validation.js";

const router = Router();

router.get("/", ProjectController.getProjects);
router.post(
  "/",
  ProjectValidation.validateCreateProject,
  ProjectController.createProject
);
router.get(
  "/:id",
  TodoValidation.validateObjectId,
  ProjectController.getProjectById
);
router.patch(
  "/:id",
  TodoValidation.validateObjectId,
  ProjectValidation.validateUpdateProject,
  ProjectController.updateProject
);
router.delete(
  "/:id",
  TodoValidation.validateObjectId,
  ProjectController.deleteProject
);

export default router;
