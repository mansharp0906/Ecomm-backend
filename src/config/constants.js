module.exports = {
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier',
    CUSTOMER: 'customer',
    VENDOR: 'vendor',
    DELIVERY: 'delivery'
  },
  PERMISSIONS: {
    // User permissions
    USER_CREATE: 'user.create',
    USER_READ: 'user.read',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',
    
    // Product permissions
    PRODUCT_CREATE: 'product.create',
    PRODUCT_READ: 'product.read',
    PRODUCT_UPDATE: 'product.update',
    PRODUCT_DELETE: 'product.delete',
    
    // Order permissions
    ORDER_CREATE: 'order.create',
    ORDER_READ: 'order.read',
    ORDER_UPDATE: 'order.update',
    ORDER_DELETE: 'order.delete',
    
    // Category permissions
    CATEGORY_CREATE: 'category.create',
    CATEGORY_READ: 'category.read',
    CATEGORY_UPDATE: 'category.update',
    CATEGORY_DELETE: 'category.delete'
  },
  DEFAULT_ROLE_PERMISSIONS: {
    admin: [
      'user.create', 'user.read', 'user.update', 'user.delete',
      'product.create', 'product.read', 'product.update', 'product.delete',
      'order.create', 'order.read', 'order.update', 'order.delete',
      'category.create', 'category.read', 'category.update', 'category.delete'
    ],
    manager: [
      'user.read', 'user.update',
      'product.create', 'product.read', 'product.update',
      'order.read', 'order.update',
      'category.create', 'category.read', 'category.update'
    ],
    cashier: [
      'product.read',
      'order.create', 'order.read', 'order.update'
    ],
    customer: [
      'product.read',
      'order.create', 'order.read'
    ],
    vendor: [
      'product.create', 'product.read', 'product.update',
      'order.read'
    ],
    delivery: [
      'order.read', 'order.update'
    ]
  }
};