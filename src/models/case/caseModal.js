import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  fileUrl: String,
  fileName: String,
  uploadedAt: { type: Date, default: Date.now },
});

const NoteSchema = new mongoose.Schema({
  author: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const CaseSchema = new mongoose.Schema(
  {
    // ======================
    // Basic Information
    // ======================
    caseType: {
      type: String,
      enum: ["New", "Continuation", "Remake"],
    },
    caseNumber: {
      type: String,
    },
    patientID: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female"] },
    age: { type: Number, min: 1, max: 150 },
    scanNumber: { type: String, trim: true },

    // ======================
    // Tier Selection
    // ======================
    selectedTier: {
      type: String,
      enum: ["Standard", "Premium"],
    },
    workCategory: { type: String, enum: ["Crown/Bridge", "Dentures", "Misc"] },

    // ======================
    // Standard Tier
    // ======================
    standard: {
      pfm: {
        singleUnitCrown: {
          enabled: { type: Boolean, default: false },
          porcelainButtMargin: { type: String, enum: ["360", "Buccal Only"] },
          teeth: [String],
          shade: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
        marylandBridge: {
          enabled: { type: Boolean, default: false },
          ponticDesign: {
            type: String,
            enum: [
              "Full ridge",
              "Modify ridge lap",
              "No contact",
              "Point contact",
              "Point in socket (ovate)",
            ],
          },
          ponticTeeth: [String],
          wingTeeth: [String],
          shade: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
        conventionalBridge: {
          enabled: { type: Boolean, default: false },
          ponticDesign: {
            type: String,
            enum: [
              "Full ridge",
              "Modify ridge lap",
              "No contact",
              "Point contact",
              "Point in socket (ovate)",
            ],
          },
          teeth: [String],
          shade: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
      },
      fullCast: {
        materialType: { type: String, enum: ["NP (silver coloured)"] },
        singleUnitCrown: {
          enabled: Boolean,
          teeth: [String],
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
        bridge: {
          enabled: Boolean,
          teeth: [String],
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
        postAndCore: {
          enabled: Boolean,
          teeth: [String],
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
        conventionalBridge: {
          enabled: Boolean,
          ponticDesign: {
            type: String,
            enum: [
              "Full ridge",
              "Modify ridge lap",
              "No contact",
              "Point contact",
              "Point in socket (ovate)",
            ],
          },
          teeth: [String],
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
      },
      metalFree: {
        enabled: Boolean,
        type: { type: String, enum: ["Composite Inlay/Onlay"] },
        teeth: [String],
        specialInstructions: String,
        attachments: [AttachmentSchema],
      },
      dentures: {
        categoryType: {
          type: String,
          enum: ["Denture Construction", "Denture Other"],
        },
        construction: {
          enabled: Boolean,
          selectedOptions: [
            {
              type: String,
              enum: [
                "Bite block",
                "Special Tray",
                "Clasps",
                "Mesh Reinforcement",
                "Try In",
                "Re-try in",
                "Finish",
              ],
            },
          ],
          biteBlock: { upper: Boolean, lower: Boolean },
          specialTray: { upper: Boolean, lower: Boolean },
          clasps: { type: Number, min: 0 },
          meshReinforcement: Boolean,
          tryInMetalFrameworkCoCr: Boolean,
          reTryIn: Boolean,
          finishAcrylic: Boolean,
          finishFlexi: Boolean,
          teethSelection: [String],
          shade: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
        other: {
          enabled: Boolean,
          selectedOptions: [
            { type: String, enum: ["Reline", "Repair", "Addition"] },
          ],
          teethSelection: [String],
          shade: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
      },
    },

    // ======================
    // Premium Tier
    // ======================
    premium: {
      crownBridge: {
        subCategory: { type: String, enum: ["Emax", "Zirconia", "Metal Free"] },
        emax: {
          enabled: Boolean,
          type: {
            type: String,
            enum: [
              "Single Unit Crown",
              "Veneer",
              "Maryland Bridge",
              "Conventional Bridge",
            ],
          },
          teeth: [String],
          shade2D: String,
          shade3D: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
        zirconia: {
          enabled: Boolean,
          type: {
            type: String,
            enum: [
              "Single Unit Crown",
              "Veneer",
              "Maryland Bridge",
              "Conventional Bridge",
            ],
          },
          teeth: [String],
          shade2D: String,
          shade3D: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
        metalFree: {
          enabled: Boolean,
          teeth: [String],
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
      },
      dentures: {
        categoryType: {
          type: String,
          enum: ["Denture Construction", "Denture Other"],
        },
        construction: {
          enabled: Boolean,
          selectedOptions: [
            {
              type: String,
              enum: [
                "Bite block",
                "Special Tray",
                "Clasps",
                "Mesh Reinforcement",
                "Try In with metal framework CoCr",
                "Re-try in",
                "Finish Acrylic",
                "Finish Flexi",
              ],
            },
          ],
          biteBlock: { upper: Boolean, lower: Boolean },
          specialTray: { upper: Boolean, lower: Boolean },
          clasps: { type: Number, min: 0 },
          meshReinforcement: Boolean,
          tryInMetalFrameworkCoCr: Boolean,
          reTryIn: Boolean,
          finishAcrylic: Boolean,
          finishFlexi: Boolean,
          teethSelection: [String],
          shade: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
        other: {
          enabled: Boolean,
          selectedOptions: [{ type: String }],
          teethSelection: [String],
          shade: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
      },
      implants: {
        enabled: Boolean,
        asStandard: Boolean,
        noPostCoreOption: Boolean,
        specialInstructions: String,
        attachments: [AttachmentSchema],
      },
      orthodontic: {
        enabled: Boolean,
        type: { type: String, enum: ["Fixed retainer", "Essix retainer"] },
        specialInstructions: String,
        attachments: [AttachmentSchema],
      },
    },

    // ======================
    // Misc Section (Both Tiers)
    // ======================
    misc: {
      enabled: Boolean,
      type: {
        type: String,
        enum: [
          "Study models",
          "Sports Guard",
          "TW",
          "Night Guard",
          "Vacuum formed Stent",
          "Re-etch Crown/Bridge",
        ],
      },
      studyModels: { diagnosticWax: Boolean, selectedTeeth: [String] },
      sportsGuard: { colour: String },
      tw: { withReservoirs: Boolean, withoutReservoirs: Boolean },
      nightGuard: {
        material: { type: String, enum: ["Soft", "Hard", "Hard Acrylic"] },
        withReservoir: Boolean,
        withoutReservoir: Boolean,
      },
      specialInstructions: String,
      attachments: [AttachmentSchema],
    },

    // ======================
    // Common Fields
    // ======================
    globalSpecialInstructions: String,
    globalAttachments: [AttachmentSchema],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled", "On Hold"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Normal", "Urgent", "Rush"],
      default: "Normal",
    },
    dueDate: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    notes: [NoteSchema],
  },
  { timestamps: true }
);

// Indexes
CaseSchema.index({ patientID: 1 });
CaseSchema.index({ caseNumber: 1 });
CaseSchema.index({ status: 1 });
CaseSchema.index({ selectedTier: 1 });
CaseSchema.index({ createdAt: -1 });
CaseSchema.index({ clinicId: 1 });

export default mongoose.model("Case", CaseSchema);
