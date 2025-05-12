import React, { useState } from 'react';
import { SessionData, ExportFormat, generatePreview, exportData } from '../utils/export';
import '../styles/ExportButtons.css';

interface ExportButtonsProps {
    data: SessionData;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [previewFormat, setPreviewFormat] = useState<ExportFormat>('text');
    const [error, setError] = useState<string | null>(null);

    const handleExport = async (format: ExportFormat) => {
        try {
            setError(null);
            await exportData(data, format);
        } catch (error) {
            console.error('Export failed:', error);
            setError('Failed to export file. Please try again.');
        }
    };

    const handlePreview = (format: ExportFormat) => {
        setPreviewFormat(format);
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    return (
        <div className="export-section">
            <div className="export-buttons">
                <button
                    className="export-button text"
                    onClick={() => handleExport('text')}
                    title="Export as text file"
                >
                    📝 Export as Text
                </button>
                <button
                    className="export-button json"
                    onClick={() => handleExport('json')}
                    title="Export as JSON file"
                >
                    📊 Export as JSON
                </button>
                <button
                    className="export-button markdown"
                    onClick={() => handleExport('markdown')}
                    title="Export as Markdown file"
                >
                    📋 Export as Markdown
                </button>
                <button
                    className="export-button html"
                    onClick={() => handleExport('html')}
                    title="Export as HTML file"
                >
                    🌐 Export as HTML
                </button>
            </div>

            <div className="preview-buttons">
                <button
                    className="preview-button"
                    onClick={() => handlePreview('text')}
                    title="Preview as text"
                >
                    👁️ Preview Text
                </button>
                <button
                    className="preview-button"
                    onClick={() => handlePreview('markdown')}
                    title="Preview as markdown"
                >
                    👁️ Preview Markdown
                </button>
                <button
                    className="preview-button"
                    onClick={() => handlePreview('html')}
                    title="Preview as HTML"
                >
                    👁️ Preview HTML
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {showPreview && (
                <div className="preview-modal">
                    <div className="preview-content">
                        <div className="preview-header">
                            <h3>Preview ({previewFormat})</h3>
                            <button className="close-button" onClick={closePreview}>×</button>
                        </div>
                        <div className="preview-body">
                            <pre>{generatePreview(data, previewFormat)}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportButtons; 