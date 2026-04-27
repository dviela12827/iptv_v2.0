@echo off
set GIT=C:\Program Files\Git\bin\git.exe
"%GIT%" add .
"%GIT%" commit -m "Fix: force-dynamic no checkout para corrigir build Vercel"
"%GIT%" push origin main
echo Push concluido!
