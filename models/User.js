import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const ItemSchema = new Schema({
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  servingSize: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const AddressSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: {
    type: String,
    required: true,
  },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: {
    type: String,
    required: true,
  },
});

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    cart: { type: [ItemSchema], default: [] },
    address: { type: [AddressSchema], default: [] },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 14);
  next();
});

export const User = model("User", UserSchema);
