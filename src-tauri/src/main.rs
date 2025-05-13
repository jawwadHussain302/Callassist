use std::process::Command;
use std::fs;
use std::path::Path;
use tauri::command;

#[command]
fn transcribe_audio(file_path: Option<String>, filename: Option<String>) -> Result<String, String> {
    println!("Transcribe_audio called with:");
    println!("  file_path: {:?}", file_path);
    println!("  filename: {:?}", filename);
    
    // Get the audio file path based on the parameters
    let audio_file_path = if let Some(path) = file_path {
        println!("Using provided file path: {}", path);
        std::path::PathBuf::from(path)
    } else if let Some(name) = filename {
        // If only a filename is provided, construct the path using the app data directory
        println!("Using filename to construct path: {}", name);
        
        // Get the app data directory with app identifier
        let app_data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
            .ok_or_else(|| "Failed to get app data directory".to_string())?;
        
        println!("App data directory: {:?}", app_data_dir);
        
        // Create audio_uploads directory in the app data directory
        let audio_uploads_dir = app_data_dir.join("audio_uploads");
        if !audio_uploads_dir.exists() {
            fs::create_dir_all(&audio_uploads_dir)
                .map_err(|e| format!("Failed to create audio_uploads directory: {}", e))?;
            println!("Created audio_uploads directory: {:?}", audio_uploads_dir);
        }
        
        // Construct path using the filename
        let path = audio_uploads_dir.join(&name);
        
        if !path.exists() {
            println!("Audio file not found at expected path: {:?}", path);
            
            let legacy_app_dir = app_data_dir.parent().ok_or_else(|| "Failed to get parent directory".to_string())?;
            let legacy_uploads_dir = legacy_app_dir.join("audio_uploads");
            let legacy_file_path = legacy_uploads_dir.join(&name);
            
            println!("Checking legacy path: {:?}", legacy_file_path);
            
            if legacy_file_path.exists() {
                println!("Found audio file at legacy path: {:?}", legacy_file_path);
                return Err(format!("File found at incorrect path: {:?}. Please upload the file again using the updated app.", legacy_file_path));
            }
        }
        
        path
    } else {
        return Err("Neither file_path nor filename provided".to_string());
    };
    
    println!("Audio file path: {:?}", audio_file_path);
    let output_file_path = audio_file_path.with_extension("wav.txt");
    println!("Output file path: {:?}", output_file_path);
    
    // Check if audio file exists
    if !audio_file_path.exists() {
        return Err(format!("Audio file not found: {:?}", audio_file_path));
    }
    
    // Get the whisper executable path relative to the project root directory
    let current_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    
    let project_root = current_dir.parent()
        .ok_or_else(|| "Failed to get parent directory".to_string())?;
    
    println!("Current directory: {:?}", current_dir);
    println!("Project root directory: {:?}", project_root);
    
    let whisper_exe = if cfg!(target_os = "windows") {
        "whisper/whisper.bat"
    } else {
        "whisper/whisper"
    };
    
    // Construct the whisper path relative to the project root
    let whisper_path = project_root.join(whisper_exe);
    
    // Check if whisper executable exists
    if !whisper_path.exists() {
        return Err(format!("Whisper executable not found at: {:?}", whisper_path));
    }
    
    // Get the model path relative to the project root directory
    let model_path = project_root.join("whisper/models/ggml-base.en.bin");
    
    println!("Model path: {:?}", model_path);
    
    // Check if model exists
    if !model_path.exists() {
        return Err(format!("Model file not found at: {:?}", model_path));
    }
    
    // Run whisper command with correct arguments for the batch file
    println!("Executing whisper with arguments: {:?} {:?}", &audio_file_path, &output_file_path);
    
    // Create a detailed log of the execution
    println!("Whisper path: {:?}", &whisper_path);
    println!("Audio file path: {:?}", &audio_file_path);
    println!("Output file path: {:?}", &output_file_path);
    println!("Model path: {:?}", &model_path);
    
    let output = Command::new(&whisper_path)
        .arg(&audio_file_path)
        .arg(&output_file_path)
        .output()
        .map_err(|e| format!("Failed to execute whisper: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    
    println!("Whisper command exit code: {}", output.status);
    println!("Whisper stdout: {}", stdout);
    println!("Whisper stderr: {}", stderr);
    
    if !output.status.success() {
        let error_message = if stderr.trim().is_empty() {
            if stdout.trim().is_empty() {
                format!("Whisper execution failed with exit code: {}", output.status)
            } else {
                format!("Whisper execution failed: {}", stdout)
            }
        } else {
            format!("Whisper execution failed: {}", stderr)
        };
        
        println!("Error message: {}", error_message);
        return Err(error_message);
    }
    
    println!("Whisper execution successful");
    println!("Output file path: {:?}", output_file_path);
    println!("Command output: {}", String::from_utf8_lossy(&output.stdout));
    
    // Check if the output file exists
    if !output_file_path.exists() {
        return Err(format!("Output file not found: {:?}", output_file_path));
    }
    
    // Read the contents of the output file
    let transcript = fs::read_to_string(&output_file_path)
        .map_err(|e| format!("Failed to read output file: {}", e))?;
    
    println!("Transcript: {}", transcript);
    Ok(transcript)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![transcribe_audio])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
