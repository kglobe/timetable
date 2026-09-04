@echo off
cd /d C:\GitHub\timetable
node scripts\fetch-lunch.mjs
git add lunch.json
git diff --cached --quiet || git commit -m "chore: update lunch menu" && git push
