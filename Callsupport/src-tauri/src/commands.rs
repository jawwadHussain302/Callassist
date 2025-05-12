use std::process::Command;
use tauri::{command, AppHandle};
use std::path::PathBuf;

#[command]
pub async fn transcribe_audio(app_handle: AppHandle, filename: String) -> Result<String, String> {
    // Get the resource directory for binaries
    let resource_dir = app_handle
        .path_resolver()
        .resource_dir()
        .ok_or_else(|| "Failed to get resource directory".to_string())?;

    // Get the app directory for user data
    let app_dir = app_handle
        .path_resolver()
        .app_dir()
        .ok_or_else(|| "Failed to get app directory".to_string())?;

    // Construct paths
    let whisper_path = resource_dir.join("binaries").join("whisper").join("whisper-x86_64-pc-windows-msvc.exe");
    let model_path = resource_dir.join("binaries").join("whisper").join("models").join("ggml-base.bin");
    let audio_path = app_dir.join("audio_uploads").join(&filename);

    // Debug prints for paths
    println!("Resource directory: {:?}", resource_dir);
    println!("App directory: {:?}", app_dir);
    println!("Whisper path: {:?}", whisper_path);
    println!("Model path: {:?}", model_path);
    println!("Audio path: {:?}", audio_path);

    // Verify files exist
    if !whisper_path.exists() {
        return Err(format!("Whisper executable not found at: {:?}", whisper_path));
    }
    if !model_path.exists() {
        return Err(format!("Model file not found at: {:?}", model_path));
    }
    if !audio_path.exists() {
        return Err(format!("Audio file not found at: {:?}", audio_path));
    }

    // Create audio_uploads directory if it doesn't exist
    let audio_dir = app_dir.join("audio_uploads");
    if !audio_dir.exists() {
        std::fs::create_dir_all(&audio_dir)
            .map_err(|e| format!("Failed to create audio_uploads directory: {}", e))?;
    }

    // Construct and print the command
    let command_str = format!(
        "{} --model {} --file {}",
        whisper_path.display(),
        model_path.display(),
        audio_path.display()
    );
    println!("Executing command: {}", command_str);

    // Execute the command
    let output = Command::new(&whisper_path)
        .args([
            "--model",
            &model_path.to_string_lossy(),
            "--file",
            &audio_path.to_string_lossy(),
        ])
        .current_dir(&app_dir)
        .output()
        .map_err(|e| format!("Failed to execute whisper: {}", e))?;

    // Print command output
    println!("Command stdout: {}", String::from_utf8_lossy(&output.stdout));
    println!("Command stderr: {}", String::from_utf8_lossy(&output.stderr));

    if !output.status.success() {
        return Err(format!(
            "Whisper failed with status {}: {}",
            output.status,
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
} 