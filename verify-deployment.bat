@echo off
echo ===== Deployment Verification =====

echo Checking build output...
if exist dist (
    echo ✓ Build output exists
) else (
    echo ✗ Build output missing - run 'npm run build'
    exit /b 1
)

echo Checking Lambda package...
if exist aws\lambda\function.zip (
    echo ✓ Lambda package exists
) else (
    echo ✗ Lambda package missing - run deployment script
)

echo Checking environment configuration...
if exist .env (
    echo ✓ Environment file exists
) else (
    echo ! Environment file missing - copy .env.example to .env and configure
)

echo Verification complete!