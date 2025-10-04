import mongoose from "mongoose";
const { Schema } = mongoose;

const aboutUsSchema = new Schema({

    description: {
        type: String,
        required: [true],
        trim: true,
    },
    image: {
        type: [String],
    },
   
});

export default mongoose.model("AboutUs", aboutUsSchema);
