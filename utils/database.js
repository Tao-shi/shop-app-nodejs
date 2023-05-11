const mongoose = require("mongoose");

module.exports = mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
});
