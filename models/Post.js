const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
    default: "",
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: "User",
  }],
  images: [
    {
    type: String,
    default: "",
    }
  ],
  comments:[
    {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Post", PostSchema);
