#!/bin/bash

# get logs:
# ssh user@host 'docker logs -t yandexdialogswhatis_yandex-dialogs-whatis_1 | docker-logs-localtime' > data/whatis.log

# sorted
cat data/whatis.log | sort -k4 -nk3 > data/sorted.log

# input
cat data/whatis.log | grep '>' | sort -k11 > data/in.log
cat data/whatis.log | grep '>' | sort -k11 | uniq > data/in-uniq.log
