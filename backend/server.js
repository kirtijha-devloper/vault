const app = require('./src/app');
require('dotenv').config();
const { isEphemeralRuntime } = require('./src/utils/uploadPaths');

const PORT = process.env.PORT || 5000;

if (!isEphemeralRuntime()) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
