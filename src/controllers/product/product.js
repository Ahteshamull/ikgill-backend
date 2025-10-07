import Product from "../../models/product/product.js";

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
                
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(totalProducts / limit);
        
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            pagination: {
                currentPage: page,
                totalPages,
                limit,
            },
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get single product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: product,
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};