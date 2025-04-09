import { Op, Sequelize } from "sequelize";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import {
  created,
  catchError,
  successOk,
  successOkWithData,
  sequelizeValidationError,
  frontError,
} from "../../utils/responses.js";
import Project from "../../models/project/project.model.js";
import { convertToLowercase } from "../../utils/utils.js";
import Student from "../../models/student/student.model.js";
import Application from "../../models/application/application.model.js";

// ========================= Add Project ============================

export async function addProject(req, res) {
  try {
    const userUid = req.user.uuid;

    const reqBodyFields = bodyReqFields(req, res, [
      "title",
      "trade",
      "sector",
      "description",
      "requirements",
      "location",
      "address",
      "tehsil",
      "district",
      "province",
      "duration",
      "startDate",
      "endDate",
      "deadline",
      "totalSlots",
    ]);
    if (reqBodyFields.error) return reqBodyFields.response;

    // ✅ Convert relevant fields to lowercase (excluding sensitive ones)
    const excludedFields = ["startDate", "endDate", "totalSlots"];
    const requiredData = convertToLowercase(req.body, excludedFields);
    let {
      title,
      trade,
      sector,
      description,
      requirements,
      location,
      address,
      tehsil,
      district,
      province,
      duration,
      startDate,
      endDate,
      deadline,
      totalSlots,
    } = requiredData;

    const projectData = {
      title,
      trade,
      sector,
      description,
      requirements,
      location,
      address,
      tehsil,
      district,
      province,
      duration,
      startDate,
      endDate,
      deadline,
      totalSlots,
      slotsFilled: 0,
      createdByUuid: userUid,
      creatorType: "employer",
    };

    console.log("===========================");
    console.log(projectData);
    console.log("===========================");

    await Project.create(projectData);
    return created(res, "Project created successfully.");
  } catch (error) {
    console.log(error);
    if (error instanceof Sequelize.ValidationError) {
      return sequelizeValidationError(res, error);
    }
    return catchError(res, error);
  }
}

// ========================= Get All Projects ============================

export async function getAllProjects(req, res) {
  try {
    const userUid = req.user.uuid;

    const projects = await Project.findAll({
      where: { createdByUuid: userUid },
    });
    return successOkWithData(res, "Projects retrieved successfully", projects);
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Get Project by ID ============================

export async function getProjectDetails(req, res) {
  try {
    const reqBodyFields = queryReqFields(req, res, ["uuid"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { uuid } = req.query;

    const project = await Project.findByPk(uuid);
    if (!project) return frontError(res, "Invalid uuid.");
    return successOkWithData(res, "Project retrieved successfully", project);
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Update Project ============================

export async function updateProjectDetails(req, res) {
  try {
    const reqBodyFields = queryReqFields(req, res, ["uuid"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { uuid } = req.query;

    const project = await Project.findByPk(uuid);
    if (!project) return frontError(res, "Invalid uuid.");

    const {
      title,
      trade,
      sector,
      description,
      requirements,
      location,
      address,
      tehsil,
      district,
      province,
      duration,
      startDate,
      endDate,
      deadline,
      totalSlots,
    } = req.body;

    let fieldsToUpdate = {};

    if (title) fieldsToUpdate.title = title;
    if (trade) fieldsToUpdate.trade = trade;
    if (sector) fieldsToUpdate.sector = sector;
    if (description) fieldsToUpdate.description = description;
    if (requirements) fieldsToUpdate.requirements = description;
    if (location) fieldsToUpdate.location = location;
    if (address) fieldsToUpdate.address = address;
    if (tehsil) fieldsToUpdate.tehsil = tehsil;
    if (district) fieldsToUpdate.district = district;
    if (province) fieldsToUpdate.province = province;
    if (duration) fieldsToUpdate.duration = duration;
    if (startDate) fieldsToUpdate.startDate = startDate;
    if (endDate) fieldsToUpdate.endDate = endDate;
    if (deadline) fieldsToUpdate.deadline = deadline;
    if (totalSlots) fieldsToUpdate.totalSlots = totalSlots;

    const excludedFields = ["location", "startDate", "endDate", "totalSlots"];
    const fieldsToUpdateLowered = convertToLowercase(
      fieldsToUpdate,
      excludedFields
    );

    await project.update(fieldsToUpdateLowered, {
      where: { uuid },
    });
    return successOk(res, "Project updated successfully");
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Delete Project ============================

export async function deleteProject(req, res) {
  try {
    const reqBodyFields = queryReqFields(req, res, ["uuid"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { uuid } = req.query;

    const project = await Project.findByPk(uuid);
    if (!project) return frontError(res, "Invalid uuid.");

    await project.destroy();
    return successOkWithData(res, "Project deleted successfully");
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Project stats ============================

export async function projectStats(req, res) {
  try {
    const userUid = req.user.uuid;

    const totalProjectCount = await Project.count({
      where: { createdByUuid: userUid },
    });
    const pendingProjectCount = await Project.count({
      where: { createdByUuid: userUid, status: "pending" },
    });
    const openProjectCount = await Project.count({
      where: { createdByUuid: userUid, status: "open" },
    });
    const closedProjectCount = await Project.count({
      where: { createdByUuid: userUid, status: "closed" },
    });
    const rejectedProjectCount = await Project.count({
      where: { createdByUuid: userUid, status: "rejected" },
    });

    return successOkWithData(res, "Stats fetched successfully.", {
      totalProjectCount,
      pendingProjectCount,
      openProjectCount,
      closedProjectCount,
      rejectedProjectCount,
    });
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Enrolled Students ============================

export async function enrolledStudents(req, res) {
  try {
    const reqBodyFields = queryReqFields(req, res, ["uuid"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { uuid } = req.query;

    // Fetch students who have "accepted" applications for the given project
    const enrolledStudents = await Application.findAll({
      where: {
        projectUuid: uuid,
        status: "accepted",
        reviewedByUuid: {
          [Op.not]: null,
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: Student,
          as: "student",
          attributes: {
            exclude: [
              "password",
              "otp",
              "otpCount",
              "canChangePassword",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      ],
    });

    // Map data to return only student details
    const students = enrolledStudents.map((app) => app.student);

    return successOkWithData(
      res,
      "Enrolled students fetched successfully.",
      students
    );
  } catch (error) {
    console.log("===== Error in enrolledStudents ===== : ", error);
    return catchError(res, error);
  }
}
