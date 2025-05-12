use std::process::Command;
use std::fs;
use std::path::Path;
use tauri::command;

#[command]
fn transcribe_audio(filename: String) -> Result<String, String> {
    println!("Transcribing audio file: {}", filename);
    
    // Get the app data directory
    let app_data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or_else(|| "Failed to get app data directory".to_string())?;
    
    // Construct paths
    let audio_file_path = app_data_dir.join("audio_uploads").join(&filename);
    let output_file_path = audio_file_path.with_extension("wav.txt");
    
    println!("Audio file path: {:?}", audio_file_path);
    println!("Output file path: {:?}", output_file_path);
    
    // Check if audio file exists
    if !audio_file_path.exists() {
        return Err(format!("Audio file not found: {:?}", audio_file_path));
    }
    
    // Get the whisper executable path
    let whisper_exe = if cfg!(target_os = "windows") {
        "whisper/whisper.exe"
    } else {
        "whisper/whisper"
    };
    
    let whisper_path = Path::new(whisper_exe);
    
    // Check if whisper executable exists
    if !whisper_path.exists() {
        return Err(format!("Whisper executable not found at: {:?}", whisper_path));
    }
    
    // Get the model path
    let model_path = Path::new("whisper/models/ggml-base.en.bin");
    
    // Check if model exists
    if !model_path.exists() {
        return Err(format!("Model file not found at: {:?}", model_path));
    }
    
    // Run whisper command
    let output = Command::new(whisper_path)
        .arg("-m")
        .arg(model_path)
        .arg("-f")
        .arg(&audio_file_path)
        .arg("-o")
        .arg(app_data_dir.join("audio_uploads"))
        .output()
        .map_err(|e| format!("Failed to execute whisper: {}", e))?;
    
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Whisper execution failed: {}", error));
    }
    
    // Read the output file
    match fs::read_to_string(&output_file_path) {
        Ok(transcript) => {
            println!("Transcription successful");
            Ok(transcript)
        },
        Err(e) => {
            Err(format!("Failed to read transcript file: {}", e))
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![transcribe_audio])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
