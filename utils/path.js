const path = require("path");


// Returns the path to the process that is being run
module.exports = path.dirname(require.main.filename)