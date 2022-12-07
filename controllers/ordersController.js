const User = require("../models/user");
const Product = require("../models/products");
const Order = require("../models/orders");
const nodemailer = require ("nodemailer")
//  create order
exports.createOrder = async (req, res) => {
  try {
    // return res.json(req.body);
    const {
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    const order = await Order.create({
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });

    
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASSWORD
      }
  });
  const mailOptions = {
      from: `noreply@gmail.com <${process.env.EMAIL_FROM}>`, // sender address
      to: process.env.EMAIL_FROM, // list of receivers
      subject: 'Order Received', // Subject line
      html: `<p>Hi Admin You have received new order on HAWKERS. Kindly visit admin portal for further detail <br/></p>`// plain text body
  };
  transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log("error occur while sending email")
          // return res.json({ success: false, message: "Some error ocuur while sending email" })
      }
      else {
        console.log("emails send")
          // return res.json({ success: true })
      }
  });
    return res.json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Some internal server error",
    });
  }
};

// get single order by id
exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res.json({success: false, message: "No order found with this id"});
    }
    return res.json({
      success: true,
      message: "Orders found successfully",
      data: order,
    });
  } catch (error) {
    return res.json({success: false, message: "Some internal error occur"});
  }
};

// get my orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({user: req.user.id});
    if (!orders) {
      return res.json({success: false, message: "No orders found"});
    }
    return res.json({
      success: true,
      message: "Orders found successfully",
      data: orders,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Some internal server",
      error: error,
    });
  }
};

// get all orders - only by Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders.length) {
      return res.json({success: false, message: "There are no orders", totalAmount:0, data:[]});
    }
    let totalAmount = 0;
    for (let i = 0; i < orders?.length; i++) {
      totalAmount = totalAmount + orders[i]?.totalPrice;
    }
    return res.json({
      success: true,
      message: "All orders found successfully",
      totalAmount,
      data: orders,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Some interl server occur",
      error: error,
    });
  }
};

// update / process order = only by ADMIN
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.json({success: false, message: "This order is not exists"});
    }
    if (order?.orderStatus === "Delivered") {
      return res.json({
        success: false,
        message: "You have already delivered this order",
      });
    }
    (order.orderStatus = req.body.status), (order.deliverAt = Date.now());
    await order.save();
    order?.orderItems.forEach(async (item) => {
      await updateStock(item.product, item.quantity);
    });
    return res.json({
      success: true,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Some internal server occur",
      error: error,
    });
  }
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock = product.stock - quantity;
  // product?.stock = product?.stock < 0 ? product?.stock= 0 : product.stock
  await product.save({validateBeforeSave: false});
}

// delete order by admin
exports.deleteOrder = async (req,res)=>{
    try{
        const order = await Order.findById(req.params.id)
        if (!order){
            return res.json({success:false, message:"No order found with this id"})
        }
        await order.remove();
        return res.json({success:true, message:"Order deleted successfully", data:order})
    }catch(error){
        return res.json({success:false, message:"Some internal error occur", error:error})
    }
}