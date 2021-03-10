const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 7 },
  googleId: { type: String, default: null },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.__v;

  return userObj;
};

userSchema.statics.findByCredentials = async function (email, plainPW) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password);

    if (isMatch) return user;
    return null;
  }
  return null;
};

userSchema.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

const UserModel = model("User", userSchema);

module.exports = UserModel;