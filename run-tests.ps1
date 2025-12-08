$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Preparation de l'environnement de test..."

$envExample = Join-Path $root "back\env.docker.example"
$envFile = Join-Path $root "back\.env.docker"
if (-not (Test-Path $envFile)) {
  if (Test-Path $envExample) {
    Write-Host "Fichier .env.docker introuvable, copie depuis l'exemple..."
    Copy-Item $envExample $envFile -Force
  }
  else {
    Write-Warning "Aucun env.docker trouvé. Créez back\.env.docker à partir des variables nécessaires."
  }
}

$coverageDir = Join-Path $root "back\coverage"
if (-not (Test-Path $coverageDir)) {
  Write-Host "Création du dossier coverage requis..."
  New-Item -ItemType Directory -Force -Path $coverageDir | Out-Null
}

Write-Host "Lancement des tests (docker compose run --rm backend-tests)..."
docker compose run --rm backend-tests

