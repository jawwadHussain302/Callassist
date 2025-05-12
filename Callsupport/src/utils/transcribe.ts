import { invoke } from '@tauri-apps/api/tauri';

export async function transcribeAudio(filename: string): Promise<string> {
    try {
        console.log('Starting transcription for file:', filename);
        console.log('Invoking transcribe_audio command with filename:', filename);
        
        const transcript = await invoke<string>('transcribe_audio', { filename });
        
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