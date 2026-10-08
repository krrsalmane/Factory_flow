const mongoose = require('mongoose');

const installationSchema = new mongoose.Schema(
  {
    installed: { type: Boolean, default: true },
    installedAt: { type: Date, default: Date.now },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Installation', installationSchema);