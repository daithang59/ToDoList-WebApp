import BaseController from "./BaseController.js";
import ProjectService from "../services/ProjectService.js";

/**
 * ProjectController - HTTP handlers for projects
 */
class ProjectController extends BaseController {
  static getProjects = BaseController.asyncHandler(async (req, res) => {
    const memberId = req.user?.id;
    const projects = await ProjectService.getProjects({ memberId });
    res.json(projects);
  });

  static createProject = BaseController.asyncHandler(async (req, res) => {
    const memberId = req.user?.id;
    const project = await ProjectService.createProject(req.body, memberId);
    res.status(201).json(project);
  });

  static getProjectById = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    const project = await ProjectService.getProjectById(id, memberId);
    res.json(project);
  });

  static updateProject = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    const project = await ProjectService.updateProject(id, req.body, memberId);
    res.json(project);
  });

  static deleteProject = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    await ProjectService.deleteProject(id, memberId);
    res.json({ message: "Project deleted", id });
  });
}

export default ProjectController;
