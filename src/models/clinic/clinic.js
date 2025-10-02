import mongoose from "mongoose";
const { Schema } = mongoose;

const clinicSchema = new Schema(
    {
        name: {
            type: String,
            required: [true],
            trim: true,
        },
        email: {
            type: String,
            required: [true],
            unique: [true],
            trim: true,
        },
        details: {
            type: String,
            required: [true],
            trim: true,
        },
        clinicStatus: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
           
        },

    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Clinic", clinicSchema);
