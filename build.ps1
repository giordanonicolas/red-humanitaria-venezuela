Set-Location "C:\Users\PerGio\Documents\Claude\Projects\Red Humanitaria Venezuela"

$conflicto = "src\app\(dashboard)\page.tsx"
if (Test-Path $conflicto) {
    Remove-Item $conflicto -Force
    Write-Host "Archivo conflictivo eliminado." -ForegroundColor Green
}

Write-Host "Corriendo build de produccion..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Build exitoso." -ForegroundColor Green
    Write-Host ""
    $deploy = Read-Host "Desplegar en Vercel ahora? (s/n)"
    if ($deploy -eq "s") {
        npx vercel --prod
    }
} else {
    Write-Host ""
    Write-Host "Build fallido. Revisa los errores arriba." -ForegroundColor Red
}
