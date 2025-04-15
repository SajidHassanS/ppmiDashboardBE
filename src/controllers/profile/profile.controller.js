import { convertToLowercase, getRelativePath, validateCountryCode, validatePhone } from "../../utils/utils.js";
import {
    catchError,
    validationError,
    successOk,
    successOkWithData,
    UnauthorizedError,
} from "../../utils/responses.js";
import PpmiAdmin from "../../models/user/user.model.js";

// ========================= Get Profile ============================

export async function getProfile(req, res) {
    try {
        const userUid = req.userUid

        const profile = await PpmiAdmin.findOne({
            where: { uuid: userUid },
            attributes: {
                exclude: ["password", "otp", "otpCount", "canChangePassword", "createdAt", "updatedAt"]
            }
        });
        if (!profile) return UnauthorizedError(res, "Invalid token");

        return successOkWithData(res, "Profile fetched successfully", profile);
    } catch (error) {
        return catchError(res, error);
    }
}

// ========================= Update Profile ============================

export async function updateProfile(req, res) {
    try {
        const userUid = req.userUid

        const { name, countryCode, phone, address, tehsil, district, province } = req.body;

        let fieldsToUpdate = {};

        // If countryCode is updated, ensure that phoneNo is also provided
        if (countryCode && !phone) return validationError(res, "Phone number must be provided when changing the country code.");

        if (name) fieldsToUpdate.name = name;

        // Validate phone number if provided
        if (phone) {
            // ✅ Validate Phone Number
            const phoneError = validatePhone(phone);
            if (phoneError) return validationError(res, phoneError, "phone");
            fieldsToUpdate.phone = phone;
        }

        // Validate country code if provided
        if (countryCode) {
            // ✅ Validate Country Code
            const countryCodeError = validateCountryCode(countryCode);
            if (countryCodeError) return validationError(res, countryCodeError, "countryCode");
            fieldsToUpdate.countryCode = countryCode;
        }

        if (address) fieldsToUpdate.address = address;
        if (tehsil) fieldsToUpdate.tehsil = tehsil;
        if (district) fieldsToUpdate.district = district;
        if (province) fieldsToUpdate.province = province;

        // If profileImg is provided, handle the upload
        if (req.file) {
            const profileImgPath = getRelativePath(req.file.path); // Get the relative path for the image
            fieldsToUpdate.profileImg = profileImgPath; // Add the profileImg path to the update fields
        }

        const excludedFields = ["countryCode", "phone", "profileImg"];
        const fieldsToUpdateLowered = convertToLowercase(fieldsToUpdate, excludedFields);

        await PpmiAdmin.update(fieldsToUpdateLowered, {
            where: { uuid: userUid },
        });

        return successOk(res, "Profile updated successfully.");
    } catch (error) {
        return catchError(res, error);
    }
}