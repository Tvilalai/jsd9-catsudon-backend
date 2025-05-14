import { Router } from "express";

const router = Router()

import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/ordersControllers.js";

router.get("/orders", getAllOrders);

router.get("/orders/:orderId", getOrderById);

router.post("/orders", createOrder);

router.put("/orders/:orderId", updateOrder);

router.delete("/orders/:orderId", deleteOrder);

export default router;