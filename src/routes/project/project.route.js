import express from "express";
import * as jobCtrl from "../../controllers/project/project.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Post Project (Employer)
// router.post("/add", verifyToken, jobCtrl.addProject);

// ✅ Get All Projects (Filtering & Display)
router.get("/list", verifyToken, jobCtrl.getAllProjects);

// ✅ Get Single Project
router.get("/get", verifyToken, jobCtrl.getProjectDetails);

// ✅ Update Project
// router.patch("/update", verifyToken, jobCtrl.updateProjectDetails);

// ✅ Delete Project
// router.delete("/delete", verifyToken, jobCtrl.deleteProject);

// ✅ Project stats
router.get("/stats", verifyToken, jobCtrl.projectStats);

// ✅ Enrolled Students in a Project
// router.get("/enrolled-students", verifyToken, jobCtrl.enrolledStudents);

export default router;
