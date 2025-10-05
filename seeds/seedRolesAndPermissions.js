// seeds/seedRolesAndPermissions.js
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const constants = require('../src/config/constants');

// Always require models directly to ensure registration
const Permission = require('../src/models/Permission');
const Role = require('../src/models/Role');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomm';

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // 1. Seed Permissions
  const permissionNames = Object.values(constants.PERMISSIONS);
  const permissionDocs = [];
  for (const name of permissionNames) {
    let perm = await Permission.findOne({ name });
    if (!perm) {
      perm = await Permission.create({ name, description: name });
      console.log('Created permission:', name);
    }
    permissionDocs.push(perm);
  }

  // 2. Seed Roles
  const roleNames = Object.keys(constants.DEFAULT_ROLE_PERMISSIONS);
  for (const roleName of roleNames) {
    let role = await Role.findOne({ name: roleName });
    const permNames = constants.DEFAULT_ROLE_PERMISSIONS[roleName];
    const permIds = permissionDocs.filter(p => permNames.includes(p.name)).map(p => p._id);
    if (!role) {
      role = await Role.create({
        name: roleName,
        description: `${roleName} role`,
        permissions: permIds,
        isDefault: roleName === 'customer',
        status: 'active'
      });
      console.log('Created role:', roleName);
    } else {
      role.permissions = permIds;
      await role.save();
      console.log('Updated role:', roleName);
    }
  }

  // 3. Ensure first admin user exists (hardcoded)
  const adminRole = await Role.findOne({ name: 'admin' });
  if (adminRole) {
    let adminUser = await User.findOne({ email: 'admin@ecomm.com' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = new User({
        name: 'Admin',
        email: 'admin@ecomm.com',
        password: hashedPassword,
        role: adminRole._id,
        status: 'active'
      });
      await adminUser.save();
      console.log('Created admin user: admin@ecomm.com / admin123');
    } else {
      adminUser.role = adminRole._id;
      await adminUser.save();
      console.log('Admin user already exists, updated role.');
    }
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});