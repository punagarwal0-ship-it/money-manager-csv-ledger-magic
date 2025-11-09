# Setup script for Windows
$ErrorActionPreference = "Stop"

Write-Host "Setting up Money Manager Application..." -ForegroundColor Green

# Check if Python is installed
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed. Please install Python 3.8 or later." -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
if (!(Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $secretKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
    @"
FLASK_SECRET_KEY=$secretKey
TRANSACTIONS_FILE=transactions.csv
FLASK_HOST=0.0.0.0
FLASK_PORT=8000
FLASK_DEBUG=False
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

# Check if transactions.csv exists
if (!(Test-Path "transactions.csv")) {
    Write-Host "Creating transactions.csv..." -ForegroundColor Yellow
    "ID,Date,Type,Category,Amount,PaymentMethod,Description" | Out-File -FilePath "transactions.csv" -Encoding UTF8
}

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host "`nTo run the application in development mode:"
Write-Host "1. Ensure virtual environment is activated: .\venv\Scripts\Activate"
Write-Host "2. Run: python codefinance.py"
Write-Host "`nTo run in production mode with Gunicorn:"
Write-Host "1. Ensure virtual environment is activated: .\venv\Scripts\Activate"
Write-Host "2. Run: gunicorn -c gunicorn.conf.py codefinance:app"