#!

rm -rf archive
mkdir archive

mkdir -p archive/_platform_specific/x86-32/
mkdir -p archive/_platform_specific/x86-64/
mkdir -p archive/_platform_specific/arm/
cp -L _platform_specific/x86-32/video_encoder_main-x86-32.nexe archive/_platform_specific/x86-32/video_encoder_main-x86-32.nexe
cp -L _platform_specific/x86-64/video_encoder_main-x86-64.nexe archive/_platform_specific/x86-64/video_encoder_main-x86-64.nexe
cp -L _platform_specific/arm/video_encoder_main-arm.nexe archive/_platform_specific/arm/video_encoder_main-arm.nexe

mkdir -p archive/_platform_specific/all/
cp -L _platform_specific/x86-32/video_encoder_main-x86-32.nexe archive/_platform_specific/all/video_encoder_main-x86-32.nexe
cp -L _platform_specific/x86-64/video_encoder_main-x86-64.nexe archive/_platform_specific/all/video_encoder_main-x86-64.nexe
cp -L _platform_specific/arm/video_encoder_main-arm.nexe archive/_platform_specific/all/video_encoder_main-arm.nexe

cp -L background.html archive/background.html
cp -r css archive/css
cp -r fonts archive/fonts
cp -r images archive/images
cp -r javascripts archive/javascripts
cp -L manifest.json archive/manifest.json
cp -L manifest_encoder.nmf archive/manifest_encoder.nmf
cp -L popup.html archive/popup.html
cp -r webfonts archive/webfonts


rm     "Archive$(cat manifest.json | grep \"version\" | cut -d \" -f 4).zip"
zip -r "Archive$(cat manifest.json | grep \"version\" | cut -d \" -f 4).zip" archive

rm -rf archive
