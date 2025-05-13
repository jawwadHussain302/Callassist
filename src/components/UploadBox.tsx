import React, { useRef, useEffect } from 'react';
import { writeBinaryFile, createDir } from '@tauri-apps/api/fs';
import { appDataDir } from '@tauri-apps/api/path';

interface UploadBoxProps {
    onTranscribe: (filename: string) => Promise<void>;
    fileName: string;
    setFileName: (name: string) => void;
    isUploading: boolean;
    setIsUploading: (uploading: boolean) => void;
    error: string;
    setError: (error: string) => void;
    duration: string;
    setDuration: (duration: string) => void;
}

const UploadBox: React.FC<UploadBoxProps> = ({
    onTranscribe,
    fileName,
    setFileName,
    isUploading,
    setIsUploading,
    error,
    setError,
    duration,
    setDuration
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset file input when fileName is cleared
    useEffect(() => {
        if (!fileName && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [fileName]);

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file size (100MB = 100 * 1024 * 1024 bytes)
        if (file.size > 100 * 1024 * 1024) {
            setError('File size exceeds 100MB limit');
            setFileName('');
            setDuration('');
            return;
        }

        // Check file type
        const validTypes = ['.mp3', '.wav', '.m4a'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!validTypes.includes(fileExtension)) {
            setError('Invalid file type. Please upload .mp3, .wav, or .m4a files');
            setFileName('');
            setDuration('');
            return;
        }

        setError('');
        setFileName(file.name);
        setIsUploading(true);

        try {
            // Get the app's data directory
            const appDataDirPath = await appDataDir();
            console.log('App data directory:', appDataDirPath);

            // Create audio_uploads directory in the app's data directory
            const uploadDir = `${appDataDirPath}/audio_uploads`;
            try {
                await createDir(uploadDir, { recursive: true });
                console.log('Created audio_uploads directory at:', uploadDir);
            } catch (dirError) {
                console.error('Error creating directory:', dirError);
                // Continue anyway as the directory might already exist
            }

            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Write file to audio_uploads directory
            try {
                const uploadPath = `${uploadDir}/${file.name}`;
                await writeBinaryFile(uploadPath, uint8Array);
                console.log('File uploaded successfully to:', uploadPath);
            } catch (writeError) {
                console.error('Error writing file:', writeError);
                setError(`Failed to write file: ${writeError}`);
                setFileName('');
                setDuration('');
                return;
            }

            // Create audio element to get duration
            const audio = new Audio(URL.createObjectURL(file));
            audio.addEventListener('loadedmetadata', () => {
                setDuration(formatDuration(audio.duration));
            });

            audio.addEventListener('error', (e) => {
                console.error('Error loading audio:', e);
                setError('Error loading audio file');
                setFileName('');
                setDuration('');
            });

        } catch (err) {
            console.error('Upload error:', err);
            setError(`Failed to upload file: ${err}`);
            setFileName('');
            setDuration('');
        } finally {
            setIsUploading(false);
        }
    };

    const handleTranscribe = async () => {
        if (!fileName) return;
        try {
            await onTranscribe(fileName);
        } catch (err) {
            setError('Transcription failed');
            console.error('Transcription error:', err);
        }
    };

    return (
        <div className="upload-box">
            <div className="upload-area">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav,.m4a"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={isUploading}
                    id="audio-upload"
                />
                <label htmlFor="audio-upload" className="upload-label">
                    {isUploading ? 'Uploading...' : 'Click to Upload Audio'}
                </label>
                <p className="upload-hint">Supported formats: MP3, WAV, M4A (max 100MB)</p>
            </div>
            {error && <p className="error">{error}</p>}
            {fileName && (
                <div className="file-info">
                    <p>File: {fileName}</p>
                    {duration && <p>Duration: {duration}</p>}
                    <button
                        className="transcribe-button"
                        onClick={handleTranscribe}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Transcribe'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadBox;      