const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    minlength: [3, "Please provide a name at least 3 characters"],
    maxlength: [15, "Please provide a name with maximum 15 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    match: [
      /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
    unique: true,
  },
  private: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Please provide a password at least 6 characters"],
    select: false,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  likePosts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
  ],
  savedPosts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
  ],
  posts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
  ],
  place: {
    type: String,
  },
  githubURL: {
    type: String,
  },
  followings: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  stories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Story",
    },
  ],
  friendRequests: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
followRequests: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  viewedStories: [{
    type: Schema.Types.ObjectId,
    ref: 'Story'
  }],
comments: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Comment",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tempToken: {
    type: String,
  },
  tempTokenExpire: {
    type: Date,
  },
});
UserSchema.methods.getTempTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex");
  const { TEMP_TOKEN_EXPIRE } = process.env;
  const tempToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");
  this.tempToken = tempToken;
  this.tempTokenExpire = Date.now() + parseInt(TEMP_TOKEN_EXPIRE);
  return tempToken;
};
UserSchema.methods.generateJwtFromUser = function () {
  const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;
  const payload = {
    id: this._id,
    name: this.name,
    profilePicture: this.profilePicture,
  };

  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRE,
  });
  
  return token;
};

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const saltRounds = 10;
  const myPlaintextPassword = this.password;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(myPlaintextPassword, salt, (err, hash) => {
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});
UserSchema.index({ name: 'text' });
module.exports = mongoose.model("User", UserSchema);
