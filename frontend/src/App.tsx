import { useEffect, useState } from 'react';
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
    getCurrentUser()
      .then(async (currentUser) => {
        if (currentUser) return currentUser;
        return signIn();
      })
      .then((currentUser) => {
        setUser(currentUser);
        setPhase('entry');
      })
      .catch((signInError: unknown) => {
        setError(signInError instanceof Error ? signInError.message : 'ArcGIS sign-in failed.');
        setPhase('signedout');
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
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">GIS</span>
          <span className="brand-title">
            GIS for Good
            <small>Submit a Resource</small>
          </span>
        </div>
        {user && (
          <button type="button" className="signout-btn" onClick={signOut}>
            Sign out ({user.username})
          </button>
        )}
      </header>

      {error && (
        <div className="alert alert--error" role="alert">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {phase === 'loading' && (
        <div className="panel">
          <div className="status"><span className="spinner" aria-hidden="true" /> Loading…</div>
        </div>
      )}

      {phase === 'signedout' && (
        <>
          <section className="hero">
            <span className="eyebrow">Resource Catalog</span>
            <h1>Share a resource with the GIS for Good Hub</h1>
            <p>
              Paste a resource link and we’ll auto-draft the catalog entry for you to review,
              then publish it straight to the Hub.
            </p>
          </section>
          <div className="panel">
            <h2>Sign in to continue</h2>
            <p className="sub">Use your ArcGIS organization account to submit a resource.</p>
            <button type="button" className="btn btn--primary btn--lg" onClick={handleSignIn}>
              Sign in with ArcGIS
            </button>
          </div>
        </>
      )}

      {phase === 'entry' && (
        <>
          <section className="hero">
            <span className="eyebrow">Resource Catalog</span>
            <h1>Submit a resource</h1>
            <p>Drop in a link and we’ll draft the catalog fields from the page. You review and edit before anything is published.</p>
          </section>
          <div className="panel">
            <label className="field">
              <span className="field-label">Resource URL<span className="req">*</span></span>
              <input
                type="url"
                className="input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
              />
            </label>
            <div className="actions">
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={handleExtract}
                disabled={!/^https?:\/\//i.test(url)}
              >
                Auto-draft from page →
              </button>
            </div>
          </div>
        </>
      )}

      {phase === 'drafting' && (
        <div className="panel">
          <div className="status">
            <span className="spinner" aria-hidden="true" />
            Reading the page and drafting fields…
          </div>
        </div>
      )}

      {phase === 'review' && (
        <>
          <div className="panel">
            <ThumbnailPanel previewUrl={previewUrl} onUpload={handleUpload} />
          </div>
          <div className="panel">
            <ReviewForm draft={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
              onSubmit={handleSubmit} submitting={false} />
          </div>
        </>
      )}

      {phase === 'done' && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="done-badge" aria-hidden="true">✓</div>
          <h2>Submitted</h2>
          <p className="sub">
            Your resource is now in the catalog — new feature object ID <span className="oid">{newObjectId}</span>.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => { setDraft(emptyDraft()); setUrl(''); setThumb(null); setPreviewUrl(null); setNewObjectId(null); setPhase('entry'); }}
          >
            Submit another
          </button>
        </div>
      )}
    </div>
  );
}
