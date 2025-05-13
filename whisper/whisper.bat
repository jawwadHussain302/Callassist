@echo off
setlocal enabledelayedexpansion

REM Get the directory of this batch file
set "SCRIPT_DIR=%~dp0"

REM Path to the whisper executable
set "WHISPER_EXE=%SCRIPT_DIR%whisper.exe"

REM Path to the model
set "MODEL_PATH=%SCRIPT_DIR%models\ggml-base.en.bin"

REM Check if the executable exists
if not exist "%WHISPER_EXE%" (
    echo Error: Whisper executable not found at %WHISPER_EXE%
    exit /b 1
)

REM Check if the model exists
if not exist "%MODEL_PATH%" (
    echo Error: Model file not found at %MODEL_PATH%
    echo Please download the model file and place it in the models directory.
    exit /b 1
)

REM Process command line arguments
set "INPUT_FILE=%~1"
if "%INPUT_FILE%"=="" (
    echo Error: No input file specified.
    echo Usage: %~nx0 input_file.wav [output_file.txt]
    exit /b 1
)

REM Determine output file
set "OUTPUT_FILE=%~2"
if "%OUTPUT_FILE%"=="" (
    set "OUTPUT_FILE=%INPUT_FILE%.txt"
)

echo Transcribing %INPUT_FILE% to %OUTPUT_FILE% using real Whisper...
echo Using model: %MODEL_PATH%

REM Run the actual whisper executable with proper arguments
"%WHISPER_EXE%" -m "%MODEL_PATH%" -f "%INPUT_FILE%" -o "%OUTPUT_FILE%"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Whisper transcription failed with error code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo Transcription completed successfully.
echo Output saved to: %OUTPUT_FILE%

exit /b 0
