#!/usr/bin/env bash
# Exit early on error
set -e

# Perform our installations
if test -n "$TEST_IMAGEMAGICK"; then
  # Install imagemagick
  apt-get update
  apt-get install imagemagick -y
else
  # Uninstall imagemagick from Travis CI
  apt-get remove imagemagick -y

  # Download, make, and install graphicsmagick
  wget http://sourceforge.net/projects/graphicsmagick/files/graphicsmagick/1.3.17/GraphicsMagick-1.3.17.tar.xz/download --output-document GraphicsMagick-1.3.17.tar.xz
  tar xvf GraphicsMagick-1.3.17.tar.xz
  cd GraphicsMagick-1.3.17
  ./configure
  make
  make install
  cd ..
fi
