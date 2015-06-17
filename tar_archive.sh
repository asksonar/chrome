#!

tar -cvhzf "Archive$(cat manifest.json | grep \"version\" | cut -d \" -f 4).tar.gz" \
  _platform_specific/x86-32/video_encoder_main-x86-32.nexe \
  _platform_specific/x86-64/video_encoder_main-x86-64.nexe \
  _platform_specific/arm/video_encoder_main-arm.nexe \
  background.html \
  css \
  images \
  javascripts \
  manifest.json \
  manifest_encoder.nmf \
  popup.html \
  webfonts
