const fs = require('fs');
const os = require('os');
const path = require('path');

function isEphemeralRuntime() {
  return Boolean(
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.AWS_EXECUTION_ENV ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

function getUploadDir() {
  if (isEphemeralRuntime()) {
    return path.join(os.tmpdir(), 'uploads');
  }

  return path.resolve(process.cwd(), 'backend', 'uploads');
}

function ensureUploadDir() {
  const uploadDir = getUploadDir();

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return uploadDir;
}

function getUploadedFilePath(fileId) {
  return path.join(getUploadDir(), fileId);
}

module.exports = {
  ensureUploadDir,
  getUploadDir,
  getUploadedFilePath,
  isEphemeralRuntime,
};
