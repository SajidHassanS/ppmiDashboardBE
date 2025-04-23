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
import Admin from "../../models/admin/admin.model.js";
import Employer from "../../models/employer/employer.model.js";

// ========================= Add Project ============================

export async function addProject(req, res) {
  try {
    const userUid = req.user.uuid;

    const reqBodyFields = bodyReqFields(req, res, [
      "title",
      "trade",

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

export async function getAllApplications(req, res) {
  try {
    // const userUid = req.user.uuid;

    const applications = await Application.findAll({
      attributes: ["uuid", "status"],
      order: [["createdAt", "Desc"]],
      include: [
        {
          model: Project,
          as: "project",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Admin,
              as: "admin",
              required: false, // Ensures it doesn't break if the project creator is an employer
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
            {
              model: Employer,
              as: "employer",
              required: false, // Ensures it doesn't break if the project creator is an admin
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
        },
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
    return successOkWithData(
      res,
      "Projects retrieved successfully",
      applications
    );
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Get Project by ID ============================

export async function getApplicationDetails(req, res) {
  try {
    const reqBodyFields = queryReqFields(req, res, ["uuid"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { uuid } = req.query;

    const applications = await Application.findOne({
      where: { uuid },
      attributes: ["uuid", "status"],
      order: [["createdAt", "Desc"]],
      include: [
        {
          model: Project,
          as: "project",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Admin,
              as: "admin",
              required: false, // Ensures it doesn't break if the project creator is an employer
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
            {
              model: Employer,
              as: "employer",
              required: false, // Ensures it doesn't break if the project creator is an admin
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
        },
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
    if (!applications) return frontError(res, "Invalid uuid.");
    return successOkWithData(
      res,
      "Student retrieved successfully",
      applications
    );
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Update Project ============================

export async function updateStudentDetails(req, res) {
  try {
    const reqBodyFields = queryReqFields(req, res, ["uuid"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { uuid } = req.query;

    const project = await Project.findByPk(uuid);
    if (!project) return frontError(res, "Invalid uuid.");

    const {
      title,
      trade,

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

// Helpers first

async function groupByField(field) {
  const result = await Student.findAll({
    attributes: [
      [Sequelize.col(field), field],
      [Sequelize.fn("COUNT", Sequelize.col("*")), "count"],
    ],
    group: [field],
    raw: true,
  });

  return result.reduce((acc, row) => {
    const key = row[field] || "Unknown";
    const count = Number(row.count);
    if (count > 0) {
      acc[key] = count;
    }
    return acc;
  }, {});
}

async function groupApplicationsByField(field) {
  let groupColumn;

  if (field === "trade") {
    groupColumn = "trade";
  } else {
    throw new Error(`Unsupported field for grouping: ${field}`);
  }

  const result = await Application.findAll({
    attributes: [
      [Sequelize.col(`project.${groupColumn}`), groupColumn],
      [Sequelize.fn("COUNT", Sequelize.col("*")), "count"],
    ],
    include: [
      {
        model: Project,
        as: "project",
        attributes: [],
      },
    ],
    group: [Sequelize.col(`project.${groupColumn}`)],
    raw: true,
  });

  return result.reduce((acc, row) => {
    const key = row[groupColumn] || "Unknown";
    const count = Number(row.count);
    if (count > 0) {
      acc[key] = count;
    }
    return acc;
  }, {});
}

// Main controller

export async function applicationStats(req, res) {
  try {
    const totalStudents = await Student.count();

    const profileCompleted = await Student.count({
      where: { profileCompleted: true },
    });

    const totalApplications = await Application.count();

    const approvedApplications = await Application.count({
      where: { status: "accepted" },
    });

    const rejectedApplications = await Application.count({
      where: { status: "rejected" },
    });

    const pendingApplications = await Application.count({
      where: { status: "pending" },
    });

    const [byProvince, byDistrict, byGender, applicationsByTrade] =
      await Promise.all([
        groupByField("province"),
        groupByField("district"),
        groupByField("gender"),
        groupApplicationsByField("trade"),
      ]);

    return successOkWithData(res, "Stats fetched successfully.", {
      totalStudents,
      profileCompleted,
      totalApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications,
      byProvince,
      byDistrict,
      byGender,
      applicationsByTrade,
    });
  } catch (error) {
    return catchError(res, error);
  }
}

// export async function applicationStats(req, res) {
//     try {
//         const totalStudents = await Student.count();

//         const profileCompleted = await Student.count({
//             where: { profileCompleted: true },
//         });

//         const [byProvince, byDistrict, byGender] = await Promise.all([
//             groupByField("province"),
//             groupByField("district"),
//             groupByField("gender"),
//         ]);

//         return successOkWithData(res, "Student stats fetched successfully.", {
//             totalStudents,
//             profileCompleted,
//             byProvince,
//             byDistrict,
//             byGender,
//         });
//     } catch (error) {
//         return catchError(res, error);
//     }
// }

// async function groupByField(field) {
//     const result = await Student.findAll({
//         attributes: [
//             [Sequelize.col(field), field],
//             [Sequelize.fn("COUNT", Sequelize.col("*")), "count"],
//         ],
//         group: [field],
//         raw: true,
//     });

//     return result.reduce((acc, row) => {
//         const key = row[field] || "Unknown";
//         const count = Number(row.count);
//         if (count > 0) {
//             acc[key] = count;
//         }
//         return acc;
//     }, {});
// }

// export async function studentStats(req, res) {
//     try {
//         const userUid = req.user.uuid;

//         const totalProjectCount = await Project.count({
//             where: { createdByUuid: userUid },
//         });
//         const pendingProjectCount = await Project.count({
//             where: { createdByUuid: userUid, status: "pending" },
//         });
//         const openProjectCount = await Project.count({
//             where: { createdByUuid: userUid, status: "open" },
//         });
//         const closedProjectCount = await Project.count({
//             where: { createdByUuid: userUid, status: "closed" },
//         });
//         const rejectedProjectCount = await Project.count({
//             where: { createdByUuid: userUid, status: "rejected" },
//         });

//         return successOkWithData(res, "Stats fetched successfully.", {
//             totalProjectCount,
//             pendingProjectCount,
//             openProjectCount,
//             closedProjectCount,
//             rejectedProjectCount,
//         });
//     } catch (error) {
//         return catchError(res, error);
//     }
// }

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
