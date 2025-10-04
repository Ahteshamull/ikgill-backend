import mongoose from "mongoose";
const { Schema } = mongoose;

const privacyPolicySchema = new Schema({

    description: {
        type: String,
        required: [true],
        trim: true,
    },
    image: {
        type: [String],
    },
   
});

export default mongoose.model("PrivacyPolicy", privacyPolicySchema);
