#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd )"
PATH=$DIR/node_modules/.bin/:$PATH
casperjs ./index.js
