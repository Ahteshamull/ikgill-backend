import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    productTier: {
      type: String,
      enum: ["Standard", "Premium"],
      required: true,
    },
    productType: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          const standardTypes = ["Crown/Bridge", "Dentures", "Misc"];
          const premiumTypes = [
            "Crown/Bridge",
            "Dentures",
            "Implants",
            "Orthodontic",
            "Misc",
          ];

          if (this.productTier === "Standard") {
            return standardTypes.includes(value);
          } else if (this.productTier === "Premium") {
            return premiumTypes.includes(value);
          }
          return false;
        },
        // Avoid referencing props.instance which can be undefined in some contexts
        message: (props) => `${props.value} is not valid for the selected product tier.`,
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

export default mongoose.model("Product", ProductSchema);
