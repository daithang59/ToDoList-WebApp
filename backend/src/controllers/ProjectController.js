import BaseController from "./BaseController.js";
import ProjectService from "../services/ProjectService.js";

/**
 * ProjectController - HTTP handlers for projects
 */
class ProjectController extends BaseController {
  static getProjects = BaseController.asyncHandler(async (req, res) => {
    const { ownerId, sharedWith } = req.query;
    const projects = await ProjectService.getProjects({ ownerId, sharedWith });
    res.json(projects);
  });

  static createProject = BaseController.asyncHandler(async (req, res) => {
    const project = await ProjectService.createProject(req.body);
    res.status(201).json(project);
  });

  static getProjectById = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await ProjectService.getProjectById(id);
    res.json(project);
  });

  static updateProject = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await ProjectService.updateProject(id, req.body);
    res.json(project);
  });

  static deleteProject = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    await ProjectService.deleteProject(id);
    res.json({ message: "Project deleted", id });
  });
}

export default ProjectController;
