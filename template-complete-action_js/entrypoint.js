const { execSync } = require('child_process');

function run() {
  const jsonFilePath = process.env['INPUT_JSON_FILE_PATH'];
  const statusToFind = process.env['INPUT_STATUS_TO_FIND'];

  if (!jsonFilePath || !statusToFind) {
    console.error('Both json_file_path and status_to_find inputs are required.');
    process.exit(1);
  }

  try {
    // Run the compiled JS file with the inputs
    execSync(`node dist/check-template-complete.js "${jsonFilePath}" "${statusToFind}"`, { stdio: 'inherit' });
  } catch (error) {
    process.exit(error.status || 1);
  }
}

run();
