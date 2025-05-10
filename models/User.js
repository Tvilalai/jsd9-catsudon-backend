import mongoose, { model, Schema } from "mongoose";

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
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    required: true,
  },
});

const AddressSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
});

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    cart: { type: [ItemSchema], default: [] },
    address: AddressSchema,
  },
  { timestamps: true }
);

export const User = model("User", UserSchema);
