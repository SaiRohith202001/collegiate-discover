import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    registrationId: { type: String, required: true, unique: true, index: true },
    eventId: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    teamName: { type: String, trim: true, default: "" },
    teamMembers: { type: [String], default: [] },
    status: { type: String, enum: ["registered", "cancelled"], default: "registered" },
    qrCode: { type: String, default: "" },
    qrScanned: { type: Boolean, default: false },
    scannedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Registration = mongoose.model("Registration", registrationSchema);
