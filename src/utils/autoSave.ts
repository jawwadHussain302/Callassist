import { fs } from '@tauri-apps/api';
import { BaseDirectory } from '@tauri-apps/api/path';
import { SessionData } from './export';

const AUTOSAVE_DIR = 'autosaves';
const AUTOSAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export class AutoSaveManager {
    private timer: NodeJS.Timeout | null = null;
    private lastSave: SessionData | null = null;

    constructor() {
        this.initializeAutoSave();
    }

    private async initializeAutoSave() {
        try {
            await fs.createDir(AUTOSAVE_DIR, { dir: BaseDirectory.App, recursive: true });
        } catch (error) {
            console.error('Failed to create autosave directory:', error);
        }
    }

    public startAutoSave(data: SessionData) {
        this.lastSave = data;
        
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(async () => {
            if (this.lastSave) {
                try {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `autosave_${timestamp}.json`;
                    const content = JSON.stringify(this.lastSave, null, 2);
                    
                    await fs.writeTextFile(
                        `${AUTOSAVE_DIR}/${filename}`,
                        content,
                        { dir: BaseDirectory.App }
                    );
                    
                    console.log('Auto-save completed:', filename);
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }
        }, AUTOSAVE_INTERVAL);
    }

    public updateData(data: SessionData) {
        this.lastSave = data;
    }

    public stopAutoSave() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
} 