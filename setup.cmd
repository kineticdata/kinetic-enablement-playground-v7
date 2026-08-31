@echo off
REM Only job: confirm Node exists, then hand off to setup.mjs.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but was not found.
  echo Install Node 20 or newer from https://nodejs.org/ and run this again.
  exit /b 1
)
node "%~dp0setup.mjs"
