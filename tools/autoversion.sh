#!/usr/bin/env bash

APP="/Users/deeeed/WebstormProjects/Passtis/PasstisApp"
cd ${APP}


ver=$(git describe --abbrev=0)
complete=$(git describe)
branch=$(git rev-parse --abbrev-ref HEAD)
commit=$(git rev-parse HEAD)
timestamp=$(git log -1 --date=short --pretty=format:%cd)

mobileConfig="${APP}/src/mobile-config.js"
tmpSettings=".tmp_settings"
settingsFile="${APP}/settings.json"

VERSION=$(jq -r '.public.version' ${settingsFile})
echo "current version is $VERSION"

## stop if current version has not been taggued (deployed)
## First check if app has already been taggued
#found=$(git tag --list | grep "$VERSION" | wc -l)
#if [ "$found" -eq 0 ] # 0 means the version has been found by grep
#then
#    echo "It seems the version $VERSION hasn't been deployed (tag doesn't exists exists)"
#    echo "Make sure to deploy it before to use auto version increment."
#    exit
#fi

# Auto increment patch number
VERSION=${VERSION%.*}.$((${VERSION##*.}+1))
#VERSION="1.4.1" # manually set new version
echo "Setting new version $VERSION"

jq --arg VERSION "$VERSION" '.public.version|="\($VERSION)"' ${settingsFile} > ${tmpSettings} && mv ${tmpSettings} ${settingsFile}
sed -i '' "s/version: '.*'/version: '$VERSION'/" ${mobileConfig}

git commit -m "bump version ${VERSION}" "${APP}/tools/autoversion.sh" ${settingsFile} ${mobileConfig}

