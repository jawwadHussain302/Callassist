import { invoke } from '@tauri-apps/api/tauri';
import { appDataDir, join } from '@tauri-apps/api/path';

export async function transcribeAudio(filename: string): Promise<string> {
    try {
        console.log('Starting transcription for file:', filename);
        
        const appDataDirPath = await appDataDir();
        const uploadDir = await join(appDataDirPath, 'audio_uploads');
        const filePath = await join(uploadDir, filename);
        
        console.log('Full file path for transcription:', filePath);
        console.log('App data directory:', appDataDirPath);
        console.log('Upload directory:', uploadDir);
        
        console.log('Invoking transcribe_audio command with filePath:', filePath);
        const transcript = await invoke<string>('transcribe_audio', { filePath });
        
        console.log('Transcription completed successfully');
        console.log('Transcript:', transcript);
        return transcript;
    } catch (error) {
        console.error('Transcription failed with error:', error);
        console.error('Error type:', typeof error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Transcription failed: ${error}`);
    }
} 