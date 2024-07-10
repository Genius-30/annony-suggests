import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verfieTokenExpiry: Date;
  isVerified: true;
  isAcceptingMessages: boolean;
  messages: Message[];
}

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "username is required!"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "email is required!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required!"],
    min: [6, "Password must be at least 6 characters long!"],
    max: [20, "Password must be between 6-20 characters!"],
  },
  verifyToken: {
    type: String,
    required: true,
  },
  verifyTokenExpiry: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    defauly: true,
  },
  messages: Schema<Message>,
});

const User = mongoose.models.users || mongoose.model<User>("User", UserSchema);

export default User;
