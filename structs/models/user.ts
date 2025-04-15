import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userId: string; // Discord user ID
  name: string; // Discord user tag
  coins: number; // User's coins
  level: number; // User's level
  experience: number; // User's experience points
  lastDaily: Date; // Timestamp of the last daily reward claim
  bets: number;
  won: number;
  deposited: number;
  withdrawn: number;
}

const UserSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String },
  coins: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  lastDaily: { type: Date, default: null },
  bets: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  deposited: { type: Number, default: 0 },
  withdrawn: { type: Number, default: 0 },
});

export const User = mongoose.model<IUser>("User", UserSchema);
