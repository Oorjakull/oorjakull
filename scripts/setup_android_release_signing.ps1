param(
  [string]$KeystorePath = "$HOME\upload-keystore.jks",
  [string]$Alias = "oorjakull-release",
  [int]$ValidityDays = 10000
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
  throw "keytool not found. Install JDK and ensure keytool is in PATH."
}

Write-Host "Creating release keystore at: $KeystorePath"
Write-Host "If prompted, use strong passwords and save them securely."

$keystoreDir = Split-Path -Parent $KeystorePath
if (-not (Test-Path $keystoreDir)) {
  New-Item -ItemType Directory -Path $keystoreDir -Force | Out-Null
}

if (-not (Test-Path $KeystorePath)) {
  keytool -genkeypair -v `
    -keystore "$KeystorePath" `
    -alias "$Alias" `
    -keyalg RSA `
    -keysize 2048 `
    -validity $ValidityDays
} else {
  Write-Host "Keystore already exists. Skipping key generation."
}

$storePassword = Read-Host "Enter keystore password to save in ~/.gradle/gradle.properties"
$keyPassword = Read-Host "Enter key password to save in ~/.gradle/gradle.properties"

$gradleUserHome = Join-Path $HOME ".gradle"
$gradlePropsPath = Join-Path $gradleUserHome "gradle.properties"
if (-not (Test-Path $gradleUserHome)) {
  New-Item -ItemType Directory -Path $gradleUserHome -Force | Out-Null
}
if (-not (Test-Path $gradlePropsPath)) {
  New-Item -ItemType File -Path $gradlePropsPath -Force | Out-Null
}

$escapedPath = $KeystorePath.Replace("\", "\\")

$block = @"

# OorjaKull Android release signing
OORJAKULL_UPLOAD_STORE_FILE=$escapedPath
OORJAKULL_UPLOAD_KEY_ALIAS=$Alias
OORJAKULL_UPLOAD_STORE_PASSWORD=$storePassword
OORJAKULL_UPLOAD_KEY_PASSWORD=$keyPassword
"@

Add-Content -Path $gradlePropsPath -Value $block

Write-Host "Release signing config saved to: $gradlePropsPath"
Write-Host "Next: run scripts/build_and_distribute_android.ps1"
