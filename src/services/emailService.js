// services/emailService.js
const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmed - #${order.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Your order has been successfully placed and is being processed.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.grandTotal}</p>
              <p><strong>Payment Method:</strong> ${order.payment.method}</p>
            </div>

            <div class="order-details">
              <h3>Shipping Address</h3>
              <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
              <p>${order.shippingAddress.address}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>
              <p>${order.shippingAddress.phone}</p>
            </div>

            <p>We'll notify you when your order ships. You can track your order from your account.</p>
            <p>Thank you for shopping with us!</p>
          </div>
          <div class="footer">
            <p>If you have any questions, contact us at support@yourstore.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderShipped: (order, user, trackingInfo) => ({
    subject: `Your Order Has Shipped! - #${order.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .tracking-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Order is on the Way!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            <div class="tracking-info">
              <h3>Tracking Information</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
              <p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
              <p><strong>Estimated Delivery:</strong> ${new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}</p>
            </div>

            <p>You can track your package using the tracking number above on the carrier's website.</p>
            <p>Thank you for your patience!</p>
          </div>
          <div class="footer">
            <p>If you have any questions, contact us at support@yourstore.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderDelivered: (order, user) => ({
    subject: `Order Delivered - #${order.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .order-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Delivered!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Your order has been successfully delivered. We hope you love your purchase!</p>
            
            <div class="order-info">
              <h3>Order Summary</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Delivered On:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.grandTotal}</p>
            </div>

            <p>If you have any issues with your order, please contact our support team within 7 days.</p>
            <p>We'd love to hear your feedback about your shopping experience!</p>
          </div>
          <div class="footer">
            <p>If you have any questions, contact us at support@yourstore.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  paymentSuccess: (order, user, transaction) => ({
    subject: `Payment Successful - #${order.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .payment-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Successful!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Your payment has been processed successfully.</p>
            
            <div class="payment-info">
              <h3>Payment Details</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Amount Paid:</strong> ₹${transaction.amount}</p>
              <p><strong>Payment Method:</strong> ${transaction.paymentMethod}</p>
              <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>Your order is now being processed. We'll notify you when it ships.</p>
            <p>Thank you for your purchase!</p>
          </div>
          <div class="footer">
            <p>If you have any questions, contact us at support@yourstore.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderCancelled: (order, user, reason) => ({
    subject: `Order Cancelled - #${order.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .cancellation-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Your order has been cancelled as requested.</p>
            
            <div class="cancellation-info">
              <h3>Cancellation Details</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Cancellation Reason:</strong> ${reason}</p>
              <p><strong>Cancelled On:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>If this was a mistake or you have any questions, please contact our support team.</p>
            <p>We hope to see you again soon!</p>
          </div>
          <div class="footer">
            <p>If you have any questions, contact us at support@yourstore.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Main email sending function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Your Store" <noreply@yourstore.com>',
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

// Specific notification functions
const sendOrderConfirmation = async (order, user) => {
  const template = emailTemplates.orderConfirmation(order, user);
  return await sendEmail(user.email, template.subject, template.html);
};

const sendOrderShipped = async (order, user, trackingInfo) => {
  const template = emailTemplates.orderShipped(order, user, trackingInfo);
  return await sendEmail(user.email, template.subject, template.html);
};

const sendOrderDelivered = async (order, user) => {
  const template = emailTemplates.orderDelivered(order, user);
  return await sendEmail(user.email, template.subject, template.html);
};

const sendPaymentSuccess = async (order, user, transaction) => {
  const template = emailTemplates.paymentSuccess(order, user, transaction);
  return await sendEmail(user.email, template.subject, template.html);
};

const sendOrderCancelled = async (order, user, reason) => {
  const template = emailTemplates.orderCancelled(order, user, reason);
  return await sendEmail(user.email, template.subject, template.html);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderShipped,
  sendOrderDelivered,
  sendPaymentSuccess,
  sendOrderCancelled,
  emailTemplates
};