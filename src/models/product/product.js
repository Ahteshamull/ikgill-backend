import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        description: String,
        stock: { type: Number, default: 0, min: 0 },
        category: String,
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
