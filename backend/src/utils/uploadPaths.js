const fs = require('fs');
const os = require('os');
const path = require('path');

function isEphemeralRuntime() {
  return Boolean(
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.AWS_EXECUTION_ENV ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

function getTemporaryUploadDir() {
  return path.join(os.tmpdir(), 'uploads');
}

function getUploadDir() {
  if (isEphemeralRuntime()) {
    return getTemporaryUploadDir();
  }

  return path.resolve(process.cwd(), 'backend', 'uploads');
}

function ensureUploadDir() {
  const preferredDir = getUploadDir();

  try {
    if (!fs.existsSync(preferredDir)) {
      fs.mkdirSync(preferredDir, { recursive: true });
    }

    return preferredDir;
  } catch (error) {
    const fallbackDir = getTemporaryUploadDir();

    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }

    return fallbackDir;
  }
}

function getUploadedFilePath(fileId) {
  return path.join(ensureUploadDir(), fileId);
}

module.exports = {
  ensureUploadDir,
  getUploadDir,
  getUploadedFilePath,
  isEphemeralRuntime,
};
