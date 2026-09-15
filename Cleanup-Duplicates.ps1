# Cleanup-Duplicates.ps1
param(
    [switch]$Execute
)

$projectRoot = Get-Location
$webRoot = Join-Path $projectRoot "apps\web"

Write-Host "=== SAFiMalmo Duplicate Cleanup ===" -ForegroundColor Cyan
Write-Host ""

if (-not $Execute) {
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host "   Add -Execute to actually move files" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "EXECUTE MODE - Files will be moved to backup" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Are you sure? Type 'YES' to continue"
    if ($confirm -ne "YES") {
        Write-Host "Operation cancelled." -ForegroundColor Red
        exit
    }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupRoot = Join-Path $projectRoot "DUPLICATE_BACKUP_$timestamp"
if ($Execute) {
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
    Write-Host "Backup folder: $backupRoot" -ForegroundColor Green
    Write-Host ""
}

$movedCount = 0

$duplicates = @(
    @{Name="app"; Root="$projectRoot\app"; Web="$webRoot\app"},
    @{Name="components"; Root="$projectRoot\components"; Web="$webRoot\components"},
    @{Name="lib"; Root="$projectRoot\lib"; Web="$webRoot\lib"},
    @{Name="utils"; Root="$projectRoot\utils"; Web="$webRoot\utils"},
    @{Name="hooks"; Root="$projectRoot\hooks"; Web="$webRoot\hooks"},
    @{Name="styles"; Root="$projectRoot\styles"; Web="$webRoot\styles"}
)

foreach ($dup in $duplicates) {
    $name = $dup.Name
    $rootPath = $dup.Root
    $webPath = $dup.Web
    
    if ((Test-Path $rootPath) -and (Test-Path $webPath)) {
        Write-Host "Found duplicate: $name" -ForegroundColor Red
        Write-Host "   Source: $rootPath" -ForegroundColor Gray
        Write-Host "   Keeping: $webPath" -ForegroundColor Green
        
        if ($Execute) {
            $dest = Join-Path $backupRoot $name
            Move-Item -Path $rootPath -Destination $dest -Force
            Write-Host "   MOVED to backup" -ForegroundColor Green
            $movedCount++
        } else {
            Write-Host "   [DRY RUN] Would move to backup" -ForegroundColor Yellow
        }
        Write-Host ""
    }
}

$nestedPath = "$projectRoot\app\components"
if (Test-Path $nestedPath) {
    Write-Host "Found nested app/components/" -ForegroundColor Red
    if ($Execute) {
        $dest = Join-Path $backupRoot "app_components_nested"
        Move-Item -Path $nestedPath -Destination $dest -Force
        Write-Host "   MOVED to backup" -ForegroundColor Green
        $movedCount++
    } else {
        Write-Host "   [DRY RUN] Would move to backup" -ForegroundColor Yellow
    }
    Write-Host ""
}

$strayRoutes = Get-ChildItem -Path $projectRoot -Recurse -Filter "route.ts" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*\apps\web\*" -and $_.FullName -notlike "*\node_modules\*" }
if ($strayRoutes) {
    Write-Host "Found stray route.ts files:" -ForegroundColor Red
    foreach ($route in $strayRoutes) {
        $parent = Split-Path $route.FullName -Parent
        $folderName = Split-Path $parent -Leaf
        Write-Host "   $parent" -ForegroundColor Gray
        if ($Execute) {
            $dest = Join-Path $backupRoot "stray_routes_$folderName"
            Move-Item -Path $parent -Destination $dest -Force
            Write-Host "   MOVED $parent to backup" -ForegroundColor Green
            $movedCount++
        } else {
            Write-Host "   [DRY RUN] Would move $parent" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

if (-not $Execute) {
    Write-Host "=== DRY RUN COMPLETE ===" -ForegroundColor Cyan
    Write-Host "To actually move files, run: .\Cleanup-Duplicates.ps1 -Execute" -ForegroundColor Yellow
} else {
    Write-Host "=== CLEANUP COMPLETE ===" -ForegroundColor Green
    Write-Host "Moved $movedCount items to backup" -ForegroundColor Green
    Write-Host "Backup location: $backupRoot" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test your application with:" -ForegroundColor Yellow
    Write-Host "   npm run build" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
}
