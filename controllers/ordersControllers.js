import Order from "../models/Order.js";

export const getAllOrders = async (req, res, next) => {
  console.log("Calling getAllOrders");
  try {
    const orders = await Order.find({})
      .populate({
        path: "userId",
        select: "firstName lastName email cart address",
      })
      .populate({ path: "orderItems.menuId", select: "name price" });

    console.log("orders retrieved:", orders);
    res.status(200).json({ error: false, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: true, message: "Order not found" });
    }
    res.status(200).json({ error: false, order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();
    res.status(201).json({ error: false, order: savedOrder });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: req.body },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: true, message: "Order not found" });
    }
    res.status(200).json({ error: false, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  if (!req.body.orderItems || !req.body.userId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.orderId);
    if (!deletedOrder) {
      return res.status(404).json({ error: true, message: "Order not found" });
    }
    res
      .status(200)
      .json({ error: false, message: "Order has been successfully deleted" });
  } catch (error) {
    next(error);
  }
};
