#!/bin/sh
set -e 
echo -e " Starting PostgreSQL initialization sequence up !\n"

exec docker-entrypoint.sh postgres
# execut ethe docker-entrypoint script inside the container and pass it postgres as an arg. becomes PID 1 