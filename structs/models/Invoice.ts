import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Discord user ID
    encryptedId: { type: String, required: true }, // Encrypted user ID
    amount: { type: Number, required: true }, // Amount in-game currency
    currency: { type: String, default: "INR" }, // Default currency INR
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }, // Payment status
    invoiceId: { type: String, required: true, unique: true }, // Oxapay invoice ID
  },
  { timestamps: true } // Adds createdAt & updatedAt timestamps
);

export const Invoice = mongoose.model("Invoice", InvoiceSchema);
