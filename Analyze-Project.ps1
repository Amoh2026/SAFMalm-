# Analyze-Project.ps1
Write-Host "=== SAFiMalmo Project Analyzer ===" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$webRoot = Join-Path $projectRoot "apps\web"

Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host "Web Root: $webRoot" -ForegroundColor Yellow
Write-Host ""

$duplicateCandidates = @("app", "components", "lib", "utils", "hooks", "styles", "types")

Write-Host "CHECKING FOR DUPLICATE FOLDERS:" -ForegroundColor Magenta
Write-Host ""

foreach ($folder in $duplicateCandidates) {
    $rootPath = Join-Path $projectRoot $folder
    $webPath = Join-Path $webRoot $folder
    
    $hasRoot = Test-Path $rootPath
    $hasWeb = Test-Path $webPath
    
    if ($hasRoot -and $hasWeb) {
        Write-Host "DUPLICATE FOUND: $folder" -ForegroundColor Red
        Write-Host "   Root: $rootPath" -ForegroundColor Gray
        Write-Host "   Web:  $webPath" -ForegroundColor Gray
        
        $rootCount = (Get-ChildItem -Path $rootPath -Recurse -File -ErrorAction SilentlyContinue).Count
        $webCount = (Get-ChildItem -Path $webPath -Recurse -File -ErrorAction SilentlyContinue).Count
        Write-Host "   Files in root: $rootCount" -ForegroundColor Yellow
        Write-Host "   Files in web:  $webCount" -ForegroundColor Yellow
        Write-Host ""
    } elseif ($hasRoot) {
        Write-Host "$folder only exists in root" -ForegroundColor Yellow
    } elseif ($hasWeb) {
        Write-Host "$folder only exists in apps/web/ (correct)" -ForegroundColor Green
    }
}

Write-Host "`nCHECKING FOR NESTED APP/COMPONENTS:" -ForegroundColor Magenta
$nestedPath = Join-Path $projectRoot "app\components"
if (Test-Path $nestedPath) {
    Write-Host "FOUND: app/components/ at $nestedPath" -ForegroundColor Red
    Write-Host "   This should be in apps/web/components/" -ForegroundColor Yellow
}

Write-Host "`nCHECKING FOR STRAY ROUTE FILES:" -ForegroundColor Magenta
$strayRoutes = Get-ChildItem -Path $projectRoot -Recurse -Filter "route.ts" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*\apps\web\*" -and $_.FullName -notlike "*\node_modules\*" }
if ($strayRoutes) {
    Write-Host "Found route.ts files outside apps/web/:" -ForegroundColor Red
    $strayRoutes | ForEach-Object { Write-Host "   $($_.FullName)" -ForegroundColor Gray }
} else {
    Write-Host "No stray route.ts files found" -ForegroundColor Green
}

Write-Host "`n=== ANALYSIS COMPLETE ===" -ForegroundColor Cyan
