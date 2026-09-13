param([Parameter(Mandatory=$true)][string]$RepositoryUrl)
$ErrorActionPreference='Stop'
if(-not (Get-Command git -ErrorAction SilentlyContinue)){throw 'Git is not installed.'}
if(-not (Test-Path '.git')){git init;git branch -M main}
git add .
if(-not (git diff --cached --quiet)){git commit -m 'Launch NFCcardo.ma'}
$remote=git remote get-url origin 2>$null
if($LASTEXITCODE -ne 0){git remote add origin $RepositoryUrl}elseif($remote -ne $RepositoryUrl){git remote set-url origin $RepositoryUrl}
git push -u origin main
Write-Host 'NFCcardo.ma is published to GitHub.' -ForegroundColor Green
