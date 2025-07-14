@echo off
echo Installing dependencies...
npm install

echo.
echo Installing additional required packages...
npm install --save-dev @types/node eslint-plugin-react typescript-eslint

echo.
echo Setup complete! 
echo.
echo To start the development server:
echo   npm run dev
echo.
echo To start the backend server:
echo   npm start
echo.
echo Make sure to set your OpenAI API key in the .env file!
pause