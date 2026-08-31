@echo off
REM Only job: confirm Node exists, then hand off to setup.mjs.
REM The `pause` lines fire only when Explorer double-click launched this file
REM (cmd.exe then puts the script path in %cmdcmdline%), so terminal runs are
REM unaffected. Without them a double-click closes the window instantly and
REM discards every line of output, including the Node-missing message below.
where node >nul 2>nul
if errorlevel 1 goto :nonode
node "%~dp0setup.mjs"
set "KP_EXIT=%errorlevel%"
echo %cmdcmdline% | find /i "%~0" >nul && pause
exit /b %KP_EXIT%

:nonode
echo Node.js is required but was not found.
echo Install Node 20 or newer from https://nodejs.org/ and run this again.
echo %cmdcmdline% | find /i "%~0" >nul && pause
exit /b 1
