import crypto from "crypto";
import { Sequelize } from "sequelize";
import BlacklistToken from "../../models/user/blackListToken.model.js";
import jwt from "jsonwebtoken";
import { bodyReqFields } from "../../utils/requiredFields.js";
import { convertToLowercase, validateCountryCode, validateEmail, validatePhone } from "../../utils/utils.js";
import {
  comparePassword,
  hashPassword,
  validatePassword,
} from "../../utils/passwordUtils.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwtTokenGenerator.js";
import { sendOTPEmail } from "../../utils/sendEmailUtils.js";
import {
  created,
  frontError,
  catchError,
  validationError,
  successOk,
  successOkWithData,
  UnauthorizedError,
  sequelizeValidationError,
  forbiddenError,
} from "../../utils/responses.js";
import Employer from "../../models/user/user.model.js";

// ========================= Register User ============================

export async function registerPpmiAdmin(req, res) {
  try {
    // ✅ Check if required fields are provided
    const reqBodyFields = bodyReqFields(req, res, [
      "email",
      "name",
      // "organization",
      "countryCode",
      "phone",
      "password",
      "confirmPassword",
    ]);
    if (reqBodyFields.error) return reqBodyFields.response;

    // ✅ Convert relevant fields to lowercase (excluding sensitive ones)
    const excludedFields = ["email", "countryCode", "phone", "password", "confirmPassword"];
    const requiredData = convertToLowercase(req.body, excludedFields);
    let { email, name, organization, countryCode, phone, password, confirmPassword } = requiredData;

    // ✅ Validate Country Code
    const countryCodeError = validateCountryCode(countryCode);
    if (countryCodeError) return validationError(res, countryCodeError, "countryCode");

    // ✅ Validate Phone Number
    const phoneError = validatePhone(phone);
    if (phoneError) return validationError(res, phoneError, "phone");

    // ✅ Validate Email Format
    const invalidEmail = validateEmail(email);
    if (invalidEmail) return validationError(res, invalidEmail);

    // ✅ Check if the Email Already Exists
    const employerExist = await Employer.findOne({ where: { email } });
    if (employerExist) return validationError(res, "This email is already registered.", "email");

    // ✅ Check if Passwords Match (Explicitly Checking Here)
    if (password !== confirmPassword) {
      return validationError(res, "Passwords do not match.", "password");
    }

    // ✅ Validate Password Format
    const invalidPassword = validatePassword(password);
    if (invalidPassword) return validationError(res, invalidPassword);

    // ✅ Hash Password Before Saving
    const hashedPassword = await hashPassword(password);

    // ✅ Prepare Data for Insertion
    const employerData = {
      email,
      name,
      organization,
      countryCode,
      phone,
      password: hashedPassword,
    };

    // ✅ Create New User in Database
    await Employer.create(employerData);

    return created(res, "Profile created successfully.");
  } catch (error) {
    // ✅ Handle Sequelize Validation Errors
    if (error instanceof Sequelize.ValidationError) {
      return sequelizeValidationError(res, error);
    }
    // ✅ Catch Any Other Errors
    return catchError(res, error);
  }
}

// ========================= Login User ============================

export async function loginPpmiAdmin(req, res) {
  try {
    const reqBodyFields = bodyReqFields(req, res, ["email", "password"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { email, password } = req.body;

    // Check if a user with the given email not exists
    const user = await Employer.findOne({ where: { email: email } });
    if (!user) return validationError(res, "Invalid email or password");

    // Compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return validationError(res, "Invalid email or password");

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // If passwords match, return success
    return successOkWithData(res, "Login successful", { accessToken, refreshToken });
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Regenerate Access Token ============================

export async function regenerateAccessToken(req, res) {
  try {
    const reqBodyFields = bodyReqFields(req, res, ["refreshToken"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { refreshToken } = req.body;
    const { invalid, expired, userUid } = verifyRefreshToken(refreshToken);

    if (invalid) return validationError(res, "Invalid refresh token");
    if (expired) return forbiddenError(res, "Refresh token has expired. Please log in again.");

    const newAccessToken = generateAccessToken({ uuid: userUid });

    return successOkWithData(res, "Access Token Generated Successfully", { accessToken: newAccessToken });
  } catch (error) {
    return catchError(res, error);
  }
};

// ========================= Update Password ============================

export async function updatePassword(req, res) {
  try {
    const userUid = req.userUid
    const reqBodyFields = bodyReqFields(req, res, ["oldPassword", "newPassword", "confirmPassword"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Check if a user exists
    const employer = await Employer.findOne({ where: { uuid: userUid } });
    if (!employer) return UnauthorizedError(res, "Invalid token");

    // Compare oldPassword with hashed password in database
    const isMatch = await comparePassword(oldPassword, employer.password);
    if (!isMatch) return validationError(res, "Invalid old password", "oldPassword");

    const invalidPassword = validatePassword(newPassword, confirmPassword);
    if (invalidPassword) return validationError(res, invalidPassword);

    // Check if oldPassword and newPassword are the same
    if (oldPassword === newPassword) return validationError(res, "New password must be different from old password");

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    // // Update employer's password in the database
    await employer.update({ password: hashedPassword });

    return successOk(res, "Password updated successfully.");
  } catch (error) {
    catchError(res, error);
  }
}

// ========================= Forgot Password ============================

export async function forgotPassword(req, res) {
  try {
    const reqBodyFields = bodyReqFields(req, res, ["email"]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { email } = req.body;

    // Check if a employer with the given email exists
    const employer = await Employer.findOne({ where: { email } });
    if (!employer) return validationError(res, "This email is not registered.", "email");

    // generating otp
    const otp = crypto.randomInt(100099, 999990);

    // Save OTP in the database within transaction
    await Employer.update({ otp, otpCount: 0 }, { where: { email } });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) return catchError(res, "Something went wrong. Failed to send OTP.");

    return successOk(res, "OTP sent successfully");
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Verify OTP ============================

export async function verifyOtp(req, res) {
  try {
    const reqBodyFields = bodyReqFields(req, res, ["email", "otp"]);
    if (reqBodyFields.error) return reqBodyFields.response;
    const { email, otp } = req.body;

    // Check if a employer with the given email exists
    const employer = await Employer.findOne({ where: { email } });
    if (!employer) return frontError(res, "This email is not registered.", "email");

    if (employer.otpCount >= 3) return validationError(res, "Maximum OTP attempts reached. Please regenerate OTP.");

    // Compare OTP; if incorrect, increment otp_count
    if (employer.otp !== parseInt(otp, 10)) {
      await employer.update({ otpCount: employer.otpCount + 1 });
      return validationError(res, "Invalid OTP");
    }

    // OTP matched, reset otp_count and set can_change_password to true
    await employer.update({ otpCount: 0, canChangePassword: true });

    return successOk(res, "OTP Verified Successfully");
  } catch (error) {
    return catchError(res, error);
  }
}

// ========================= Set New Password ============================

export async function setNewPassword(req, res) {
  try {
    const reqBodyFields = bodyReqFields(req, res, [
      "newPassword",
      "confirmPassword",
      "email",
    ]);
    if (reqBodyFields.error) return reqBodyFields.response;

    const { newPassword, confirmPassword, email } = req.body;

    // Check if a employer with the given email exists
    const employer = await Employer.findOne({ where: { email } });
    if (!employer) return frontError(res, "User not found");

    // Check if passwords match
    const invalidPassword = validatePassword(newPassword, confirmPassword);
    if (invalidPassword) return validationError(res, invalidPassword);

    // Only allow if canChangePassword is true (i.e., OTP verified)
    if (employer.canChangePassword === false) {
      return UnauthorizedError(res, "Unauthorized");
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update employer's password in the database
    await Employer.update(
      {
        password: hashedPassword,
        canChangePassword: false,
        otp: null,
        otpCount: 0,
      },
      {
        where: { email },
      }
    );

    return successOk(res, "Password updated successfully.");
  } catch (error) {
    catchError(res, error);
  }
}

// ========================= Logout ============================

export async function logoutUser(req, res) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return validationError(res, "Authorization token is required.");

    // Verify JWT token (instead of decode)
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, jwtSecret);
    } catch (err) {
      return validationError(res, "Invalid or expired token.");
    }

    // Convert expiry time from seconds to milliseconds
    const expiryTime = new Date(decodedToken.exp * 1000);

    // Blacklist the token
    await BlacklistToken.create({ token, expiry: expiryTime });

    successOk(res, "Logout successful");
  } catch (error) {
    console.log(error);
    catchError(res, error);
  }
}