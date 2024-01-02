const mongoose = require("mongoose");
const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
  },
  expireAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Subscriber = mongoose.model("Subscriber", SubscriberSchema);

module.exports = Subscriber;
