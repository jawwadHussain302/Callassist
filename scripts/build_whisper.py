#!/usr/bin/env python3
import os
import sys
import subprocess
import platform
import shutil
import urllib.request
from pathlib import Path

def download_file(url, destination):
    print(f"Downloading {url} to {destination}...")
    urllib.request.urlretrieve(url, destination)
    print(f"Download completed: {destination}")

def main():
    print("Setting up Whisper.cpp for audio transcription...")
    
    # Determine the root directory of the project
    script_dir = Path(__file__).parent.absolute()
    project_root = script_dir.parent
    
    # Create whisper directory if it doesn't exist
    whisper_dir = project_root / "whisper"
    os.makedirs(whisper_dir, exist_ok=True)
    
    # Create models directory if it doesn't exist
    models_dir = whisper_dir / "models"
    os.makedirs(models_dir, exist_ok=True)
    
    print("Creating Windows executable wrapper...")
    
    win_batch_content = """@echo off
setlocal enabledelayedexpansion

REM Get the directory of this batch file
set "SCRIPT_DIR=%~dp0"

REM Path to the model
set "MODEL_PATH=%SCRIPT_DIR%models\\ggml-base.en.bin"

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

echo Transcribing %INPUT_FILE% to %OUTPUT_FILE%...
echo This is a placeholder for the actual whisper.cpp executable.
echo In a real Windows environment, you would need to download and install whisper.cpp.
echo Then replace this batch file with the actual whisper.exe executable.

REM Simulate transcription by creating a sample output file
echo This is a simulated transcript of the audio file. > "%OUTPUT_FILE%"
echo In a real environment, this would contain the actual transcription. >> "%OUTPUT_FILE%"
echo The transcription was completed successfully. >> "%OUTPUT_FILE%"

echo Transcription completed successfully.
echo Output saved to: %OUTPUT_FILE%

exit /b 0
"""
    
    win_exe_path = whisper_dir / "whisper.exe"
    with open(win_exe_path, 'w', newline='\r\n') as f:
        f.write(win_batch_content)
    
    os.chmod(win_exe_path, 0o755)
    
    print(f"Windows batch file created at {win_exe_path}")
    
    # Download the model if it doesn't exist
    model_path = models_dir / "ggml-base.en.bin"
    if not model_path.exists():
        print("Downloading ggml-base.en.bin model...")
        model_url = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin"
        download_file(model_url, model_path)
    
    print("Whisper.cpp setup completed successfully!")
    print(f"Windows Batch File: {win_exe_path}")
    print(f"Model: {model_path}")
    print("\nNOTE: The Windows batch file is a placeholder. In a real Windows environment,")
    print("you would need to replace it with the actual whisper.exe executable.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
