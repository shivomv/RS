const { AdminDevice } = require('/opt/RS/backend/src/models');

async function wipeDevices() {
  const count = await AdminDevice.destroy({ where: {}, truncate: true });
  console.log('SUCCESS: All devices deleted. Deleted count:', count);
  process.exit(0);
}

wipeDevices().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
