import React from 'react';

/** Small controlled inputs. No <form> tags anywhere — onChange/onClick only (per spec). */

export function TextField(props: {
  label: string; value: string | null; onChange: (v: string) => void;
  required?: boolean; maxLength?: number; multiline?: boolean;
}) {
  const { label, value, onChange, required, maxLength, multiline } = props;
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ fontWeight: 600 }}>{label}{required ? ' *' : ''}</span>
      {multiline ? (
        <textarea
          value={value ?? ''} maxLength={maxLength} rows={4}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', display: 'block' }}
        />
      ) : (
        <input
          type="text" value={value ?? ''} maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', display: 'block' }}
        />
      )}
    </label>
  );
}

export function YearField(props: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  const { label, value, onChange } = props;
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <input
        type="number" min={1900} max={2100} value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        style={{ display: 'block' }}
      />
    </label>
  );
}

export function SelectField(props: {
  label: string; value: string | null; options: readonly string[];
  onChange: (v: string | null) => void; required?: boolean;
}) {
  const { label, value, options, onChange, required } = props;
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ fontWeight: 600 }}>{label}{required ? ' *' : ''}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        style={{ display: 'block' }}
      >
        <option value="">— none —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function MultiSelectField(props: {
  label: string; value: string[] | null; options: readonly string[];
  onChange: (v: string[]) => void;
}) {
  const { label, value, options, onChange } = props;
  const selected = new Set(value ?? []);
  const toggle = (code: string) => {
    const next = new Set(selected);
    next.has(code) ? next.delete(code) : next.add(code);
    onChange([...next]);
  };
  return (
    <fieldset style={{ marginBottom: 12, border: '1px solid #ddd', padding: 8 }}>
      <legend style={{ fontWeight: 600 }}>{label}</legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => (
          <label key={o} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            <input type="checkbox" checked={selected.has(o)} onChange={() => toggle(o)} />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
