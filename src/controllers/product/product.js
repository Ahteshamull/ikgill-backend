import Product from "../../models/product/product.js";

// Create a new product with multiple images
export const createProduct = async (req, res) => {
    try {
        // Handle multiple image uploads
        const images = req.files?.map((item) => ({
            fileUrl: `${process.env.IMAGE_URL}${item.filename}`,
            fileName: item.originalname,
            uploadedAt: new Date(),
        }));

        // Prepare product data
        const productData = {
            ...req.body,
            ...(images && images.length > 0 && { images }),
        };

        const product = await Product.create(productData);
        
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        
        // Handle validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: error.errors,
            });
        }

        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
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

        // Handle new image uploads
        const newImages = req.files?.map((item) => ({
            fileUrl: `${process.env.IMAGE_URL}${item.filename}`,
            fileName: item.originalname,
            uploadedAt: new Date(),
        }));

        const updateData = { ...req.body };
        
        // If new images uploaded, add them
        if (newImages && newImages.length > 0) {
            updateData.images = newImages;
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
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