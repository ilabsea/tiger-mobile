import RNFS from 'react-native-fs';

export default function migrateImage(tableName, oldRealm, newRealm) {
  const oldObjects = oldRealm.objects(tableName);
  const newObjects = newRealm.objects(tableName);

  for (let i = 0; i < oldObjects.length; i++) {
    let oldPath = oldObjects[i].image;
    if (!oldPath) { continue; }
    let fileName = decodeURIComponent(oldPath.split('/').slice(-1)[0]);
    let newPath = `${RNFS.DocumentDirectoryPath}/${tableName.toLowerCase()}_image_${oldObjects[i].id}_${fileName}`;

    newObjects[i].image = newPath;
    RNFS.moveFile(oldPath, newPath)
      .then(() => {})
      .catch((err) => { console.log(err.message); });
  }
}
