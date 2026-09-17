import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
    passwordHash: { type: String, required: true },
    studentId: { type: String, required: true, trim: true, maxlength: 30 },
    department: { type: String, required: true, trim: true, maxlength: 120 },
    year: { type: String, required: true, trim: true, maxlength: 40 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    avatarInitials: { type: String, required: true, trim: true, maxlength: 4 },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpiresAt: { type: Date, default: null },
    savedEventIds: { type: [String], default: [] },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
  },
  { timestamps: true },
);

userSchema.methods.toPublicProfile = function toPublicProfile() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    studentId: this.studentId,
    department: this.department,
    year: this.year,
    phone: this.phone,
    avatarInitials: this.avatarInitials,
    role: this.role ?? "student",
  };
};

export const User = mongoose.model("User", userSchema);
