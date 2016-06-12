#!/bin/bash

electron-packager ./ PasstisApp --platform=darwin --arch=x64 --version=1.2.2 --icon passtis.icns --overwrite
#electron-packager ./ PasstisApp --platform=all --arch=all --version=1.2.2 --icon passtis.icns --overwrite
