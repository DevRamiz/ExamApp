$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker was not found. Install Docker Desktop, open it, and start a new PowerShell window."
}

try {
  docker info *> $null
} catch {
  throw "Docker Desktop is installed, but its engine is not running. Open Docker Desktop and wait for Engine running."
}

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example"
}

Write-Host "Building and starting ExamFlow..."
docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
  docker compose ps -a
  docker compose logs --tail=100 server
  throw "Docker Compose failed. The browser will not be opened. Review the logs above."
}

Write-Host "Waiting for the API health check..."
$serverHealthy = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
  $health = docker inspect examflow-server --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" 2>$null
  if ($health -eq "healthy") {
    $serverHealthy = $true
    break
  }
  if ($health -eq "unhealthy" -or $health -eq "exited") {
    break
  }
  Start-Sleep -Seconds 2
}

if (-not $serverHealthy) {
  docker compose ps -a
  docker compose logs --tail=150 server
  throw "The ExamFlow API did not become healthy. The browser will not be opened."
}

# The client depends on the healthy API, but this also ensures it is started after recovery.
docker compose up -d client
if ($LASTEXITCODE -ne 0) {
  throw "The client container could not be started."
}

docker compose ps

foreach ($service in @("examflow-ai", "examflow-reports")) {
  $optionalHealth = docker inspect $service --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" 2>$null
  if ($optionalHealth -ne "healthy" -and $optionalHealth -ne "running") {
    Write-Warning "$service is not healthy. Core exam features still work, but its optional feature may be unavailable."
  }
}

Write-Host "ExamFlow is ready at http://localhost:3000"
Start-Process "http://localhost:3000"
