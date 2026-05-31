/**
 * User Model
 * Defines user schema with authentication fields and role management
 */
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../config/constants');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Bu e-posta adresi zaten kullanılıyor'
      },
      validate: {
        isEmail: {
          msg: 'Geçerli bir e-posta adresi girin'
        },
        notEmpty: {
          msg: 'E-posta adresi gerekli'
        }
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Ad gerekli'
        },
        len: {
          args: [2, 100],
          msg: 'Ad 2-100 karakter arasında olmalı'
        }
      }
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Soyad gerekli'
        },
        len: {
          args: [2, 100],
          msg: 'Soyad 2-100 karakter arasında olmalı'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^(\+90|0)?[0-9]{10}$/,
          msg: 'Geçerli bir telefon numarası girin'
        }
      }
    },
    role: {
      type: DataTypes.ENUM(Object.values(USER_ROLES)),
      allowNull: false,
      defaultValue: USER_ROLES.USER
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_users_email',
        fields: ['email']
      },
      {
        name: 'idx_users_role',
        fields: ['role']
      }
    ],
    hooks: {
      // Hash password before creating user
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      // Hash password before updating if changed
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      }
    }
  });

  // Instance method to compare password
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
  };

  // Instance method to get safe user data (without password)
  User.prototype.toSafeObject = function() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.first_name,
      lastName: this.last_name,
      phone: this.phone,
      role: this.role,
      isActive: this.is_active,
      profileImage: this.profile_image,
      createdAt: this.createdAt
    };
  };

  // Instance method to check if user is admin
  User.prototype.isAdmin = function() {
    return this.role === USER_ROLES.ADMIN;
  };

  return User;
};
