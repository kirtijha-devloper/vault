const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const isServerless = process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_EXECUTION_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME;

if (!isServerless) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
