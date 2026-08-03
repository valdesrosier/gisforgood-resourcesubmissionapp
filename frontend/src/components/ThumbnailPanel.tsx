import React from 'react';

/**
 * Screenshot preview + manual upload override. A screenshot failure never blocks submission (D6);
 * the contributor can always upload their own image.
 */
export function ThumbnailPanel(props: {
  previewUrl: string | null;
  onUpload: (file: File) => void;
}) {
  const { previewUrl, onUpload } = props;
  return (
    <div style={{ marginBottom: 16 }}>
      <h3>Thumbnail</h3>
      {previewUrl ? (
        <img src={previewUrl} alt="thumbnail preview" style={{ maxWidth: 360, border: '1px solid #ddd' }} />
      ) : (
        <p style={{ color: '#a00' }}>No screenshot captured — upload an image below.</p>
      )}
      <div style={{ marginTop: 8 }}>
        <label style={{ fontWeight: 600, display: 'block' }}>Upload your own image (overrides the screenshot)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
        />
      </div>
    </div>
  );
}
