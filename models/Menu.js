import mongoose, { model, Schema } from "mongoose";

const DescriptionSchema = new Schema({
  th: { type: String, required: true },
  en: { type: String, required: true },
});

const NutritionSchema = new Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fat: { type: Number, required: true },
  carbohydrates: { type: Number, required: true },
});

const TagsSchema = new Schema({
  th: { type: [String], required: true },
  en: { type: [String], required: true },
});

const IngredientsSchema = new Schema({
  th: { type: [String], required: true },
  en: { type: [String], required: true },
});

const MenuSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: DescriptionSchema, required: true },
    nutrition: { type: NutritionSchema, required: true },
    imageUrl: { type: String, required: true },
    tags: { type: TagsSchema, required: true },
    available: { type: Boolean, default: true },
    servingSize: { type: String, required: true },
    dietary: { type: [String], required: true },
    ingredients: { type: IngredientsSchema, required: true },
    allergens: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Menu = model("Menu", MenuSchema);
