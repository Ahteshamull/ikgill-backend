import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  fileUrl: String,
  fileName: String,
  uploadedAt: { type: Date, default: Date.now },
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
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    caseNumber: {
      type: String,
    },
    patientID: { type: String, trim: true, unique: true },

    // Tier Selection
    // ======================
    selectedTier: {
      type: String,
      enum: ["Standard", "Premium"],
    },

    // ======================
    // Standard Tier
    // ======================
    standard: {
      CrownBridge: {
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
            enabled: { type: Boolean, default: false },
            teeth: [String],
            specialInstructions: String,
            attachments: [AttachmentSchema],
          },
          bridge: {
            enabled: { type: Boolean, default: false },
            teeth: [String],
            specialInstructions: String,
            attachments: [AttachmentSchema],
          },
          postAndCore: {
            enabled: { type: Boolean, default: false },
            teeth: [String],
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
            specialInstructions: String,
            attachments: [AttachmentSchema],
          },
        },
        metalFree: {
          enabled: { type: Boolean, default: false },
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
            enabled: { type: Boolean, default: false },
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
            enabled: { type: Boolean, default: false },
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
      Dentures: {
        construction: {
          enabled: { type: Boolean, default: false },

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

          biteBlock: {
            upper: { type: Boolean, default: false },
            lower: { type: Boolean, default: false },
          },

          specialTray: {
            upper: { type: Boolean, default: false },
            lower: { type: Boolean, default: false },
          },

          clasps: { type: Number, min: 0 },

          meshReinforcement: { type: Boolean, default: false },

          // Last three options — only one can be selected
          tryIn: { type: Boolean, default: false },
          reTryIn: { type: Boolean, default: false },
          finish: { type: Boolean, default: false },

          teethSelection: [String],
          shade: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },

        // -----------------------------
        // DENTURE OTHER
        // -----------------------------
        other: {
          enabled: { type: Boolean, default: false },

          selectedOptions: [
            {
              type: String,
              enum: ["Reline", "Repair", "Addition"],
            },
          ],

          teethSelection: [String],
          shade: String,
          specialInstructions: String,
          attachments: [AttachmentSchema],
        },
      },
      Misc: {
        type: Boolean,
        default: false,
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
    },
    // ======================
    // Common Fields
    // ======================
    description: {
      type: String,
    },

    globalAttachments: [AttachmentSchema],

    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "In Progress",
        "Completed",
        "Archived",
      ],
      default: "Pending",
    },
    adminApproval: {
      status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
      },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      approvedAt: Date,
      rejectionReason: String,
    },

    labManagerAssignment: {
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserRole" },
      assignedAt: Date,
    },

    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRole",
    },
    // Controllers also use `assignedTo`
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRole",
    },

    archiveDate: Date,
    isArchived: { type: Boolean, default: false },

    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByUserRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRole",
    },
  },
  { timestamps: true }
);

// Indexes
CaseSchema.index({ caseNumber: 1 });
CaseSchema.index({ status: 1 });
CaseSchema.index({ selectedTier: 1 });
CaseSchema.index({ createdAt: -1 });
CaseSchema.index({ clinicId: 1 });

export default mongoose.model("Case", CaseSchema);
