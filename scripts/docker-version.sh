#!/bin/bash
set -eu
version="$(cat package.json | grep '"version": "[0-9]' | cut -d':' -f2  | cut -d'"' -f2)"
echo "$version"
sed -i 's/image: popstas\/yandex-dialogs-whatis:.*/image: popstas\/yandex-dialogs-whatis:v'"${version}"'/g' docker-compose.yml
