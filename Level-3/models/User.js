const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    passwordSalt: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    }
  },
  { timestamps: true }
);

userSchema.methods.setPassword = function setPassword(password) {
  this.passwordSalt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto
    .pbkdf2Sync(password, this.passwordSalt, 100000, 64, 'sha512')
    .toString('hex');
};

userSchema.methods.validatePassword = function validatePassword(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.passwordSalt, 100000, 64, 'sha512')
    .toString('hex');

  return crypto.timingSafeEqual(Buffer.from(this.passwordHash), Buffer.from(hash));
};

module.exports = mongoose.model('User', userSchema);
