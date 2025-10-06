import mongoose from "mongoose";

const ProductImageSchema = new mongoose.Schema({
    fileUrl: String,
    fileName: String,
    uploadedAt: { type: Date, default: Date.now },
});

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        description: String,
        stock: { type: Number, default: 0, min: 0 },
        category: String,
        images: [ProductImageSchema],
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
