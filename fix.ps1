Set-Location "C:\Users\PerGio\Documents\Claude\Projects\Red Humanitaria Venezuela"

Write-Host ""
Write-Host "=== Node / npm version ==="
node --version
npm --version

Write-Host ""
Write-Host "[1/8] Eliminando archivos de test..."
foreach ($f in @("src\_test2.ts","src\_test3.ts","src\_test4.ts","src\_typetest.ts","src\test_types.ts")) {
    if (Test-Path $f) { Remove-Item -Force $f; Write-Host "  borrado: $f" }
}

Write-Host ""
Write-Host "[2/8] Limpiando .next..."
if (Test-Path .next) { cmd /c rmdir /s /q .next }

Write-Host ""
Write-Host "[3/8] Limpiando node_modules..."
if (Test-Path node_modules) { cmd /c rmdir /s /q node_modules }

Write-Host ""
Write-Host "[4/8] Eliminando package-lock.json..."
if (Test-Path package-lock.json) { Remove-Item -Force package-lock.json }

Write-Host ""
Write-Host "[5/8] npm install..."
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: npm install fallo"; exit 1 }

Write-Host ""
Write-Host "[6/8] Versiones instaladas..."
npm ls next react react-dom --depth=0
Write-Host ""
Write-Host "--- npm audit ---"
npm audit

Write-Host ""
Write-Host "[7/8] Build de produccion..."
npm run build
$buildResult = $LASTEXITCODE

Write-Host ""
Write-Host "--- TypeScript check ---"
npx tsc --noEmit

if ($buildResult -ne 0) {
    Write-Host ""
    Write-Host "ERROR: el build fallo. Revisar output arriba."
    exit 1
}

Write-Host ""
Write-Host "[8/8] Git..."
git rm --cached "src/_test2.ts" "src/_test3.ts" "src/_test4.ts" "src/_typetest.ts" "src/test_types.ts" 2>&1 | Out-Null
git add -A
Write-Host ""
Write-Host "--- git status ---"
git status
git commit -m "Stabilize dependencies for deployment"
git push

Write-Host ""
Write-Host "=== LISTO ==="
