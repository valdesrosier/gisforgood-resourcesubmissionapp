import React, { useEffect, useState } from 'react';
import { getCurrentUser, signIn, signOut, type SignedInUser } from './auth/arcgisAuth';
import { extractDraft, captureScreenshot } from './api/client';
import { submitResource } from './arcgis/submit';
import { emptyDraft, type ResourceDraft } from '@shared/draft';
import { ReviewForm } from './components/ReviewForm';
import { ThumbnailPanel } from './components/ThumbnailPanel';

type Phase = 'loading' | 'signedout' | 'entry' | 'drafting' | 'review' | 'done';

function base64ToBlob(b64: string, contentType: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [url, setUrl] = useState('');
  const [draft, setDraft] = useState<ResourceDraft>(emptyDraft());
  const [thumb, setThumb] = useState<{ blob: Blob; filename: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newObjectId, setNewObjectId] = useState<number | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setPhase(u ? 'entry' : 'signedout');
    });
  }, []);

  async function handleSignIn() {
    const u = await signIn();
    setUser(u);
    setPhase('entry');
  }

  async function handleExtract() {
    setError(null);
    setPhase('drafting');
    try {
      const [d, shot] = await Promise.all([extractDraft(url), captureScreenshot(url)]);
      setDraft(d);
      if (shot.image) {
        const blob = base64ToBlob(shot.image, shot.contentType ?? 'image/png');
        setThumb({ blob, filename: 'thumbnail.png' });
        setPreviewUrl(URL.createObjectURL(blob));
      } else {
        setThumb(null);
        setPreviewUrl(null);
      }
      setPhase('review');
    } catch (err: any) {
      setError(err?.message ?? 'Extraction failed.');
      setPhase('entry');
    }
  }

  function handleUpload(file: File) {
    setThumb({ blob: file, filename: file.name });
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    setError(null);
    setPhase('review');
    try {
      const result = await submitResource(draft, thumb);
      setNewObjectId(result.objectId);
      setPhase('done');
    } catch (err: any) {
      setError(err?.message ?? 'Submission failed.');
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>GIS for Good — Submit a Resource</h1>
        {user && <button type="button" onClick={signOut}>Sign out ({user.username})</button>}
      </header>

      {error && <p style={{ color: '#a00' }}>{error}</p>}

      {phase === 'loading' && <p>Loading…</p>}

      {phase === 'signedout' && (
        <div>
          <p>Sign in with your ArcGIS organization account to submit a resource.</p>
          <button type="button" onClick={handleSignIn}>Sign in</button>
        </div>
      )}

      {phase === 'entry' && (
        <div>
          <label style={{ fontWeight: 600, display: 'block' }}>Resource URL</label>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…"
            style={{ width: '100%' }} />
          <button type="button" onClick={handleExtract} disabled={!/^https?:\/\//i.test(url)} style={{ marginTop: 12 }}>
            Auto-draft from page
          </button>
        </div>
      )}

      {phase === 'drafting' && <p>Reading the page and drafting fields…</p>}

      {phase === 'review' && (
        <div>
          <ThumbnailPanel previewUrl={previewUrl} onUpload={handleUpload} />
          <ReviewForm draft={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            onSubmit={handleSubmit} submitting={false} />
        </div>
      )}

      {phase === 'done' && (
        <div>
          <h2>Submitted ✔</h2>
          <p>New feature object ID: <strong>{newObjectId}</strong></p>
          <button type="button" onClick={() => { setDraft(emptyDraft()); setUrl(''); setThumb(null); setPreviewUrl(null); setNewObjectId(null); setPhase('entry'); }}>
            Submit another
          </button>
        </div>
      )}
    </main>
  );
}
