import sequelize from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";

const Admin = sequelize.define(
  "Admin",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING, // ✅ ADD THIS FIELD
      allowNull: false, // Users must have a password
    },
    countryCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true, // Optional
    },
    cnic: {
      type: DataTypes.STRING,
      allowNull: true, // Optional
      unique: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true, // Optional
    },
    address: {
      type: DataTypes.STRING, // Address (filled later)
      allowNull: true,
    },
    tehsil: {
      type: DataTypes.STRING, // tehsil (filled later)
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING, // district (filled later)
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING, // province (filled later)
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("m&e", "apprenticeship"),
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Admin approval status
    },
    profileImg: {
      type: DataTypes.STRING, // Profile image (optional)
      allowNull: true,
    },
    otp: {
      type: DataTypes.INTEGER,
    },
    otpCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    canChangePassword: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    schema: "public",
    underscored: true,
    timestamps: true,
  }
);

export default Admin;
