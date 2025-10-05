import mongoose from "mongoose";

const CaseSchema = new mongoose.Schema(
  {
    // 🧾 Basic Info
    caseType: {
      type: String,
      enum: ["New", "Continuation", "Remake"],
      required: true,
    },
    caseNumber: {
      type: String,
      required: function () {
        return this.caseType !== "New";
      },
    },
    patientID: { type: String, required: true },
    gender: { type: String, enum: ["M", "F"], required: true },
    age: { type: Number, required: true },
    scanNumber: { type: String, required: true },

    // 🧱 Category Info
    categoryLevel: {
      type: String,
      enum: ["STANDARD", "PREMIUM"],
      required: true,
    },
    workType: {
      type: String,
      enum: ["CROWN_BRIDGE", "DENTURES", "ORTHODONTIC", "MISC"],
      required: true,
    },
    subCategory: {
      type: String,
      enum: [
        "PFM_NP",
        "FULL_CAST_NP",
        "METAL_FREE",
        "DENTURES",
        "SOFT_NIGHTGUARD",
      ],
    },

    // =========================
    // 🦷 PFM / NPF SECTION
    // =========================
    porcelainButtMargin: {
      type: String,
      enum: ["360", "Buccal Only"],
    },
    pfm_singleUnitCrown_teeth: [String],
    pfm_singleUnitCrown_shade: String,
    pfm_singleUnitCrown_instructions: String,

    pfm_marylandBridge_ponticDesign: {
      type: String,
      enum: [
        "Full ridge",
        "Modify ridge lap",
        "No contact",
        "Point contact",
        "Point in socket (ovate)",
      ],
    },
    pfm_marylandBridge_ponticTeeth: [String],
    pfm_marylandBridge_wingTeeth: [String],
    pfm_marylandBridge_shade: String,
    pfm_marylandBridge_instructions: String,

    pfm_conventionalBridge_ponticDesign: {
      type: String,
      enum: [
        "Full ridge",
        "Modify ridge lap",
        "No contact",
        "Point contact",
        "Point in socket (ovate)",
      ],
    },
    pfm_conventionalBridge_teeth: [String],
    pfm_conventionalBridge_shade: String,
    pfm_conventionalBridge_instructions: String,

    // =========================
    // 🪙 FULL CAST SECTION
    // =========================
    fullCast_materialType: {
      type: String,
      enum: ["NP (silver coloured)"],
    },
    fullCast_singleUnitCrown_teeth: [String],
    fullCast_singleUnitCrown_instructions: String,

    fullCast_conventionalBridge_ponticDesign: {
      type: String,
      enum: [
        "Full ridge",
        "Modify ridge lap",
        "No contact",
        "Point contact",
        "Point in socket (ovate)",
      ],
    },
    fullCast_conventionalBridge_teeth: [String],
    fullCast_conventionalBridge_instructions: String,

    fullCast_postAndCore_teeth: [String],
    fullCast_postAndCore_instructions: String,

    // =========================
    // ⚪ METAL FREE SECTION
    // =========================
    metalFree_type: {
      type: String,
      enum: ["Composite Inlay/Onlay"],
    },
    metalFree_teeth: [String],
    metalFree_instructions: String,

    // =========================
    // 🦷 DENTURES SECTION
    // =========================
    denture_categoryType: {
      type: String,
      enum: ["Denture Construction", "Denture Other"],
    },
    denture_options_biteBlock: [{ type: String, enum: ["upper", "lower"] }],
    denture_options_specialTray: [{ type: String, enum: ["upper", "lower"] }],
    denture_options_clasps: Number,
    denture_options_meshReinforcement: Boolean,
    denture_options_tryInMetalCoCr: Boolean,
    denture_options_reTryIn: Boolean,
    denture_options_finishAcrylic: Boolean,
    denture_options_finishFlexi: Boolean,
    denture_teethSelection2D: [String],
    denture_teethSelection3D: [String],
    denture_shade2D: String,
    denture_shade3D: String,
    denture_instructions: String,

    // =========================
    // 🦷 ORTHODONTIC SECTION
    // =========================
    ortho_type: {
      type: String,
      enum: ["Fixed Retainer", "Essix Retainer"],
    },
    ortho_instructions: String,

    // =========================
    // ⚙️ MISC SECTION
    // =========================
    misc_type: {
      type: String,
      enum: [
        "Study Models",
        "Sports Guard",
        "T/W",
        "Night Guard",
        "Vacuum Formed Splint",
        "Re-etch Crown/Bridge",
      ],
    },

    misc_studyModel_diagnosticWax: Boolean,
    misc_studyModel_selectedTeeth: [String],

    misc_sportsGuard_colour: String,

    misc_tw_withReservoirs: Boolean,
    misc_tw_withoutReservoirs: Boolean,

    misc_nightGuard_material: {
      type: String,
      enum: ["soft", "hard", "hard acrylic"],
    },
    misc_nightGuard_withReservoir: Boolean,
    misc_nightGuard_withoutReservoir: Boolean,

    misc_instructions: String,

    // =========================
    // 🗂️ Common
    // =========================
    attachments: [
      {
        fileUrl: String,
        fileName: String,
      },
    ],
    specialInstructions: String,
  },
  { timestamps: true }
);

export default mongoose.model("Case", CaseSchema);
