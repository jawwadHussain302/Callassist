use std::fs;
use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=binaries/");

    // Build Tauri
    tauri_build::build();

    // Get manifest directory
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    
    // Get the resource directory path
    let resource_dir = Path::new(&manifest_dir).join("resources");
    let binaries_dir = resource_dir.join("binaries");

    // Create directories if they don't exist
    fs::create_dir_all(&binaries_dir).unwrap();

    // Copy whisper directory
    let whisper_src = Path::new(&manifest_dir).join("binaries").join("whisper");
    let whisper_dest = binaries_dir.join("whisper");
    
    println!("Copying whisper from: {}", whisper_src.display());
    println!("Copying whisper to: {}", whisper_dest.display());

    if whisper_src.exists() {
        if whisper_dest.exists() {
            fs::remove_dir_all(&whisper_dest).unwrap();
        }
        copy_dir_all(&whisper_src, &whisper_dest).unwrap();
        println!("Successfully copied whisper directory");
    } else {
        println!("Warning: Whisper source directory not found at: {}", whisper_src.display());
    }
}

fn copy_dir_all(src: &Path, dst: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(&entry.path(), &dst.join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.join(entry.file_name()))?;
        }
    }
    Ok(())
}
