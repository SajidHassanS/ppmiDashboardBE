import express from "express";
import * as adminCtrl from "../../controllers/admin/admin.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router();


// ✅ Get All Students (Filtering & Display)
router.get("/list", verifyToken, adminCtrl.getAllAdmins);

// ✅ Post Project (Employer)
// router.post("/add", verifyToken, adminCtrl.addProject);

// ✅ Get Single Project
router.get("/", verifyToken, adminCtrl.getAdminDetails);

// ✅ Update Project
// router.patch("/", verifyToken, adminCtrl.updateStudentDetails);

// ✅ Delete Project
// router.delete("/delete", verifyToken, adminCtrl.deleteProject);

// ✅ Project stats
router.get("/stats", verifyToken, adminCtrl.adminStats);

// ✅ Enrolled Students in a Project
// router.get("/enrolled-students", verifyToken, adminCtrl.enrolledStudents);

export default router;
