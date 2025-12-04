const mongoose = require('mongoose');

const prjSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    ID: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        trim: true
    },
    components: [
        {
            id: {
                type: String,
                // required:true
            },
            name: {
                type: String,
                required: true
            },
            purpose: {
                type: String,
                trim: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            accepted: {
                type: Boolean,
                required: true,
                default: false
            },
            //Talking about these two !
            fullfilled: {
                type: Boolean
            },
            receiveMemo: {
                receivedQantity: {
                    type: Number
                },
                remark: {
                    type: String
                }
            },
            fullfilledQty: {
                type: Number
            },
            allReceived: {
                type: Boolean
            },
            carts: [
                {
                    cartID: {
                        type: String
                    },
                    fullfilledQty: {
                        type: Number
                    }

                }
            ],
            returnMemo: {
                returnQuantity: {
                    type: Number
                },
                remark: {
                    type: Number
                }
            }
        }
    ],
    componentRejections: [
        {
            remark: {
                type: String,
                required: true
            },
            componentIds: [String],
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    rejectRemark: {
        type: String
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    teamID:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    approved: {
        type: Boolean,
        default: false
    },
    batch: {
        type: Number
    },
    appMan: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Each number corresponds to a status string
        default: 0,
        required: true
    },
    guideID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        required: true
    },
    slotAssigned: {
        type: Boolean
    },
    slot: {
        slotn: {
            type: Number
        },
        date: {
            type: Date
        }
    },
    ack: {
        type: Number,
        default: -1
    },
    reports: [
        {
            reportNumber: {
                type: Number,
                required: true
            },
            fileUrl: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ["Uploaded - Not Sent", "Pending Approval", "Approved", "Rejected"],
                default: "Uploaded - Not Sent"
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            },
            rejectionReason: {
                type: String
            }
        }
    ]
});

// Pre-save hook to manage completedAt based on isCompleted
prjSchema.pre('save', function (next) {
    if (this.isModified('isCompleted')) {
        if (this.isCompleted) {
            this.completedAt = new Date();
        } else {
            this.completedAt = null;
        }
    }
    next();
});

module.exports = mongoose.model("Project", prjSchema);
