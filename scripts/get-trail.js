const { execSync } = require('child_process');

const image = process.env.IMAGE;
if (!image) {
  console.error('IMAGE env variable not set');
  process.exit(1);
}

try {
  const fingerprint = execSync(`kosli fingerprint --artifact-type=docker ${image}`, { encoding: 'utf-8' }).split('\n')[0];
  console.log(`Fingerprint: ${fingerprint}`);
  execSync(`kosli search ${fingerprint} -o json > data.json`, { encoding: 'utf-8' });
  const trail = execSync(`jq -r '.artifacts[0].trail' < data.json`, { encoding: 'utf-8' }).trim();
  console.log(`Trail: ${trail}`);
  execSync(`kosli get trail -o json ${trail} > trail.json`, { stdio: 'inherit' });
} catch (err) {
  console.error(err.message);
  process.exit(1);
}