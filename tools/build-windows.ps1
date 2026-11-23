[CmdletBinding()]
param([string]$RuntimeZip)
$ErrorActionPreference = 'Stop'
$project = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$version = '45.4.1'
$zipName = "electron-v$version-win32-x64.zip"
$expectedHash = '2BA6223AFA9121F42831FEFE92C434334907540165294FC56697449D12E7CFE9'
$identity = 'OrbitalCapital-win-x64'
$dist = Join-Path $project 'dist'
$game = Join-Path $project 'game'
if (!(Test-Path -LiteralPath (Join-Path $game 'index.html') -PathType Leaf)) {
    throw 'Missing game/index.html'
}
if (!$RuntimeZip) {
    $cache = Join-Path $env:LOCALAPPDATA 'OrbitGameBuildCache'
    New-Item -ItemType Directory -Path $cache -Force | Out-Null
    $RuntimeZip = Join-Path $cache $zipName
    if (!(Test-Path -LiteralPath $RuntimeZip -PathType Leaf)) {
        $partial = Join-Path $cache ([guid]::NewGuid().ToString() + '.download')
        try {
            $url = "https://github.com/electron/electron/releases/download/v$version/$zipName"
            & curl.exe --fail --location --silent --show-error --retry 2 --output $partial $url
            if ($LASTEXITCODE -ne 0) { throw 'Electron download failed.' }
            if ((Get-FileHash -LiteralPath $partial -Algorithm SHA256).Hash -ne $expectedHash) {
                throw 'Downloaded runtime checksum mismatch.'
            }
            Move-Item -LiteralPath $partial -Destination $RuntimeZip
        } finally {
            if (Test-Path -LiteralPath $partial) { Remove-Item -LiteralPath $partial }
        }
    }
}
$RuntimeZip = (Resolve-Path -LiteralPath $RuntimeZip).Path
if ((Get-FileHash -LiteralPath $RuntimeZip -Algorithm SHA256).Hash -ne $expectedHash) {
    throw "Unexpected runtime checksum. Obtain the official Electron v$version Windows x64 ZIP."
}
New-Item -ItemType Directory -Path $dist -Force | Out-Null
$dist = (Resolve-Path -LiteralPath $dist).Path
$destination = Join-Path $dist $identity
$stage = Join-Path $dist ('staging-' + [guid]::NewGuid())
$backup = Join-Path $dist ('previous-' + [guid]::NewGuid())

function Assert-OutputDirectory([string]$Directory) {
    $item = Get-Item -LiteralPath $Directory
    if (!$item.PSIsContainer -or $item.Parent.FullName -ne $dist -or
        ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw "Unexpected output path: $Directory"
    }
}

New-Item -ItemType Directory -Path $stage | Out-Null
try {
    & tar.exe -xf $RuntimeZip -C $stage
    if ($LASTEXITCODE -ne 0) { throw 'Electron extraction failed.' }
    Rename-Item -LiteralPath (Join-Path $stage 'electron.exe') -NewName 'OrbitalCapital.exe'
    $wer = Join-Path $stage 'electron_wer.dll'
    if (Test-Path -LiteralPath $wer) { Rename-Item -LiteralPath $wer -NewName 'OrbitalCapital_wer.dll' }
    $resources = Join-Path $stage 'resources'
    $defaultApp = Join-Path $resources 'default_app.asar'
    if (Test-Path -LiteralPath $defaultApp) { Remove-Item -LiteralPath $defaultApp }
    $appFolder = Join-Path $resources 'app'
    New-Item -ItemType Directory -Path $appFolder | Out-Null
    foreach ($part in @('package.json','game','desktop')) {
        Copy-Item -LiteralPath (Join-Path $project $part) -Destination $appFolder -Recurse
    }
    if (Test-Path -LiteralPath $destination) {
        Assert-OutputDirectory $destination
        $priorManifest = Join-Path $destination 'resources/app/package.json'
        if (!(Test-Path -LiteralPath $priorManifest -PathType Leaf) -or
            (Get-Content -LiteralPath $priorManifest -Raw -Encoding UTF8 | ConvertFrom-Json).name -ne 'orbital-capital') {
            throw 'Output folder already exists and was not produced by this build.'
        }
        Move-Item -LiteralPath $destination -Destination $backup
    }
    Assert-OutputDirectory $stage
    try { Move-Item -LiteralPath $stage -Destination $destination }
    catch {
        if (Test-Path -LiteralPath $backup) {
            Assert-OutputDirectory $backup
            Move-Item -LiteralPath $backup -Destination $destination
        }
        throw
    }
    if (Test-Path -LiteralPath $backup) {
        Assert-OutputDirectory $backup
        Remove-Item -LiteralPath $backup -Recurse -Force
    }
    Write-Output (Join-Path $destination 'OrbitalCapital.exe')
} finally {
    if (Test-Path -LiteralPath $stage) {
        Assert-OutputDirectory $stage
        Remove-Item -LiteralPath $stage -Recurse -Force
    }
}
