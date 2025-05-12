use std::process::Command;
use tauri::Runtime;

#[tauri::command]
pub async fn transcribe_audio<R: Runtime>(
    _app: tauri::AppHandle<R>,
    filename: String,
) -> Result<String, String> {
    // Construct paths relative to the app's root directory
    let whisper_exe = "whisper/whisper.exe";
    let model_path = "whisper/models/ggml-base.en.bin";
    let audio_path = format!("audio_uploads/{}", filename);

    // Execute whisper.cpp
    let output = Command::new(whisper_exe)
        .args([
            "--model",
            model_path,
            "--file",
            &audio_path,
        ])
        .output()
        .map_err(|e| format!("Failed to execute whisper: {}", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Whisper execution failed: {}", error));
    }

    // Get the transcript from stdout
    let transcript = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(transcript)
} 