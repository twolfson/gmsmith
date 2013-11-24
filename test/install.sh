#!/usr/bin/env bash

if test -n "$TEST_IMAGEMAGICK"; then
  # Install imagemagick
  sudo apt-get update
  sudo apt-get install imagemagick -y
else
  # Uninstall imagemagick from Travis CI
  sudo apt-get remove imagemagick -y

  # Download, make, and install graphicsmagick
  wget http://sourceforge.net/projects/graphicsmagick/files/graphicsmagick/1.3.17
  tar xvf GraphicsMagick-1.3.17.tar.xz
  cd GraphicsMagick-1.3.17
  ./configure
  make
  sudo make install
  cd ..
fi