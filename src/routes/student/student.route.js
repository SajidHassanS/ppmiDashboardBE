import express from "express";
import * as studentCtrl from "../../controllers/student/student.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";

const router = express.Router();


// ✅ Get All Students (Filtering & Display)
router.get("/list", verifyToken, studentCtrl.getAllStudents);

// ✅ Post Project (Employer)
// router.post("/add", verifyToken, studentCtrl.addProject);

// ✅ Get Single Project
router.get("/", verifyToken, studentCtrl.getStudentDetails);

// ✅ Update Project
// router.patch("/", verifyToken, studentCtrl.updateStudentDetails);

// ✅ Delete Project
// router.delete("/delete", verifyToken, studentCtrl.deleteProject);

// ✅ Project stats
router.get("/stats", verifyToken, studentCtrl.studentStats);

// ✅ Enrolled Students in a Project
// router.get("/enrolled-students", verifyToken, studentCtrl.enrolledStudents);

export default router;
