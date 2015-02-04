set CUR_DIR=%CD%
set FILE_DIR=%~dp0
set PRJ_DIR=%FILE_DIR%..\

cd %PRJ_DIR%
./node_modules/.bin/jsdoc -t ./node_modules/fedoc-template -c ./conf.json
grunt build
cd %CUR_DIR%
