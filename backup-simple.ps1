# MyHustle Auto-Backup Script
# Run this whenever you have working features to backup

$backupDir = "backup/auto-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
$sourceDir = "src"

Write-Host "Creating auto-backup in $backupDir..." -ForegroundColor Yellow

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Copy critical source files
Copy-Item -Path $sourceDir -Destination $backupDir -Recurse -Force

# Copy important config files
$configFiles = @(
    "package.json",
    "tsconfig.json", 
    "next.config.ts"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $backupDir -Force
    }
}

# Create backup info file
$backupInfo = @"
# Auto-Backup Info
Created: $(Get-Date)
Features: Working store profiles, authentication, booking management, navigation
Status: All major screens functional
Next: Live data integration for booking management

## Key Files Backed Up:
- src/app/store/[id]/page.tsx (complete store profile)
- src/app/store/[id]/booking-management/page.tsx (booking management)
- src/components/ui/* (neumorphic components)
- src/hooks/* (Firebase integration hooks)
- src/lib/firebase/* (repositories and config)
"@

$backupInfo | Out-File -FilePath "$backupDir/BACKUP_INFO.md" -Encoding UTF8

Write-Host "Auto-backup created successfully!" -ForegroundColor Green
Write-Host "Location: $backupDir" -ForegroundColor Cyan
