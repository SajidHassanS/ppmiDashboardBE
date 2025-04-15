import express from "express";
import * as applicationCtrl from "../../controllers/application/application.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router();


// ✅ Get All Students (Filtering & Display)
router.get("/list", verifyToken, applicationCtrl.getAllApplications);

// ✅ Post Project (Employer)
// router.post("/add", verifyToken, applicationCtrl.addProject);

// ✅ Get Single Project
router.get("/", verifyToken, applicationCtrl.getApplicationDetails);

// ✅ Update Project
// router.patch("/", verifyToken, applicationCtrl.updateStudentDetails);

// ✅ Delete Project
// router.delete("/delete", verifyToken, applicationCtrl.deleteProject);

// ✅ Project stats
router.get("/stats", verifyToken, applicationCtrl.applicationStats);

// ✅ Enrolled Students in a Project
// router.get("/enrolled-students", verifyToken, applicationCtrl.enrolledStudents);

export default router;
