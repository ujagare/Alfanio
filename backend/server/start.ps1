# Kill existing Node processes
taskkill /F /IM node.exe 2>

# Clear logs
Remove-Item -Path "logs\*" -Force -Recurse -ErrorAction SilentlyContinue

# Start server
node server.js
