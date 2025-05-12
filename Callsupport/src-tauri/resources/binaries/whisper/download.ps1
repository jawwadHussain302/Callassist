$url = "https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.4/whisper-bin-x64.exe"
$output = "whisper.exe"

Write-Host "Downloading whisper executable..."
Invoke-WebRequest -Uri $url -OutFile $output
Write-Host "Download complete. File saved as $output" 