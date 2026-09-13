@echo off
echo ===== KHOI DONG HE THONG AUTOCLEAN =====

echo [1/3] Khoi dong FastAPI...
start cmd /k "cd /d D:\LTJAVA-Project\do_an_nhom-main\ai_service && python main.py"

timeout /t 8

echo [2/3] Khoi dong Spring Boot...
start cmd /k "cd /d D:\LTJAVA-Project\do_an_nhom-main\backend && mvnw.cmd spring-boot:run"

timeout /t 40

echo [3/3] Khoi dong React...
start cmd /k "cd /d D:\LTJAVA-Project\do_an_nhom-main\frontend && npm run dev"

echo ===== HOAN THANH! =====
echo FastAPI:  http://localhost:8000/docs
echo Backend:  http://localhost:8080
echo React:    http://localhost:3000
pause
