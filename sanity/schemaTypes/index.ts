import { type SchemaTypeDefinition } from "sanity";
import { order } from "../schemas/order";
import { product } from "../schemas/product";
import { badge } from "../schemas/badge";
import { category } from "../schemas/category";
import review from "../schemas/review";
import shippingCost from "../schemas/shippingCost";
import { sizeGuide } from "../schemas/sizeGuide";
import contact from "../schemas/contact";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    order,
    product,
    badge,
    category,
    review,
    shippingCost,
    sizeGuide,
    contact,
  ],
};
