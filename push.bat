@echo off
for /f "delims=" %%i in ('where git 2^>nul') do set GIT=%%i
if "%GIT%"=="" set GIT=C:\Program Files\Git\bin\git.exe
if not exist "%GIT%" set GIT=C:\Users\ferreira\AppData\Local\Programs\Git\bin\git.exe

echo Usando git: %GIT%
"%GIT%" add .
"%GIT%" commit -m "Fix: remove unused imports causing build error"
"%GIT%" push origin main
echo Done!
pause
