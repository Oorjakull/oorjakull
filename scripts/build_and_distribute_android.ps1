param(
  [string]$WorkspaceRoot = "C:\Users\Shishir\OneDrive\Documents\Yoga_GenAI",
  [string]$FirebaseAppId = "",
  [string]$Groups = "team",
  [string]$ReleaseNotes = "Automated team build"
)

$ErrorActionPreference = 'Stop'

$frontendPath = Join-Path $WorkspaceRoot "frontend"
$androidPath = Join-Path $frontendPath "android"
$signedApkPath = Join-Path $androidPath "app\build\outputs\apk\release\app-release.apk"
$unsignedApkPath = Join-Path $androidPath "app\build\outputs\apk\release\app-release-unsigned.apk"

Write-Host "Building web assets..."
Set-Location $frontendPath
npm run build

Write-Host "Syncing Capacitor Android project..."
npx cap sync android

Write-Host "Building signed release APK..."
Set-Location $androidPath
.\gradlew.bat --no-daemon assembleRelease

if (Test-Path $signedApkPath) {
  $apkPath = $signedApkPath
} elseif (Test-Path $unsignedApkPath) {
  $apkPath = $unsignedApkPath
} else {
  throw "Release APK not found at: $signedApkPath or $unsignedApkPath"
}

Write-Host "Release APK ready: $apkPath"

if ([string]::IsNullOrWhiteSpace($FirebaseAppId)) {
  Write-Host "FirebaseAppId not provided. Skipping distribution upload."
  Write-Host "Share this file with team: $apkPath"
  exit 0
}

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
  throw "Firebase CLI not found. Install with: npm install -g firebase-tools"
}

Write-Host "Uploading to Firebase App Distribution..."
firebase appdistribution:distribute "$apkPath" --app "$FirebaseAppId" --groups "$Groups" --release-notes "$ReleaseNotes"

Write-Host "Distribution complete. Testers in group '$Groups' will get the update."
