#!
set -e

ARCHIVE_NAME="archives/Archive$(cat app/manifest.json | grep \"version\" | cut -d \" -f 4).zip"

if [ -f $ARCHIVE_NAME ]; then
  echo "Archive file '"$ARCHIVE_NAME"' already exists!"
  exit 0
fi

rm -rf archive

cp -r app archive
cp config.prod.js archive/javascripts/config.js

rm -f $ARCHIVE_NAME
zip -r $ARCHIVE_NAME archive

rm -rf archive
