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
    <div>
      <h2>Thumbnail</h2>
      <p className="sub">This image represents the resource in the catalog.</p>
      {previewUrl ? (
        <img src={previewUrl} alt="thumbnail preview" className="thumb-preview" />
      ) : (
        <div className="alert alert--error" style={{ marginBottom: 14 }}>
          <span aria-hidden="true">⚠</span>
          <span>No screenshot captured — upload an image below.</span>
        </div>
      )}
      <div className="filedrop">
        <span className="field-label" style={{ marginBottom: 0 }}>
          Upload your own image (overrides the screenshot)
        </span>
        <input
          className="file-input"
          type="file"
          accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
        />
      </div>
    </div>
  );
}
