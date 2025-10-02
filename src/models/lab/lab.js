import mongoose from "mongoose";
const { Schema } = mongoose;

const labSchema = new Schema(
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
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Lab", labSchema);
