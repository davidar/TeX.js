#!/bin/sh
trap "exit" INT TERM
trap "kill 0" EXIT
while true; do make && sleep 10; done &
python -mSimpleHTTPServer
