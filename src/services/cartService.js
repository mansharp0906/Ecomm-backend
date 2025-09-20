const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (userId) => {
  try {
    let cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'title thumbnail variants');
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }
    
    return cart;
  } catch (error) {
    throw error;
  }
};

const addToCart = async (userId, itemData) => {
  try {
    const { productId, variantId, quantity = 1 } = itemData;
    
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }

    if (variant.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.variant.toString() === variantId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price: variant.price,
        mrp: variant.mrp
      });
    }

    await cart.save();
    await cart.populate('items.product', 'title thumbnail variants');

    return cart;
  } catch (error) {
    throw error;
  }
};

const updateCartItem = async (userId, itemId, quantity) => {
  try {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    const product = await Product.findById(item.product);
    const variant = product.variants.id(item.variant);

    if (variant.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'title thumbnail variants');

    return cart;
  } catch (error) {
    throw error;
  }
};

const removeFromCart = async (userId, itemId) => {
  try {
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items.pull(itemId);
    await cart.save();
    await cart.populate('items.product', 'title thumbnail variants');

    return cart;
  } catch (error) {
    throw error;
  }
};

const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], total: 0, discount: 0, shipping: 0, tax: 0, grandTotal: 0 } },
      { new: true }
    ).populate('items.product', 'title thumbnail variants');

    return cart;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};