#!/usr/bin/env python3
import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path

def main():
    print("Building Whisper.cpp for audio transcription...")
    
    # Determine the root directory of the project
    script_dir = Path(__file__).parent.absolute()
    project_root = script_dir.parent
    
    # Create whisper directory if it doesn't exist
    whisper_dir = project_root / "whisper"
    os.makedirs(whisper_dir, exist_ok=True)
    
    # Create models directory if it doesn't exist
    models_dir = whisper_dir / "models"
    os.makedirs(models_dir, exist_ok=True)
    
    # Clone whisper.cpp if it doesn't exist
    whisper_cpp_dir = project_root / "whisper.cpp"
    if not whisper_cpp_dir.exists():
        print("Cloning whisper.cpp repository...")
        subprocess.run(["git", "clone", "https://github.com/ggerganov/whisper.cpp.git", str(whisper_cpp_dir)], check=True)
    
    # Build whisper.cpp
    os.chdir(whisper_cpp_dir)
    print("Building whisper.cpp...")
    
    if platform.system() == "Windows":
        subprocess.run(["cmake", "-B", "build"], check=True)
        subprocess.run(["cmake", "--build", "build", "--config", "Release"], check=True)
        # Copy the executable to the whisper directory
        shutil.copy("build/bin/whisper-cli.exe", whisper_dir / "whisper.exe")
    else:
        subprocess.run(["cmake", "-B", "build"], check=True)
        subprocess.run(["cmake", "--build", "build", "--config", "Release"], check=True)
        # Copy the executable to the whisper directory
        shutil.copy("build/bin/whisper-cli", whisper_dir / "whisper")
    
    # Download the model if it doesn't exist
    model_path = models_dir / "ggml-base.en.bin"
    if not model_path.exists():
        print("Downloading ggml-base.en.bin model...")
        os.chdir(whisper_cpp_dir)
        subprocess.run(["bash", "models/download-ggml-model.sh", "base.en"], check=True)
        
        # Copy the model to our models directory
        source_model = whisper_cpp_dir / "models" / "ggml-base.en.bin"
        if source_model.exists():
            shutil.copy(source_model, model_path)
            print(f"Model copied to {model_path}")
        else:
            print("Error: Model file not found after download")
            return 1
    
    print("Whisper.cpp build completed successfully!")
    print(f"Executable: {whisper_dir}/whisper{'exe' if platform.system() == 'Windows' else ''}")
    print(f"Model: {model_path}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
