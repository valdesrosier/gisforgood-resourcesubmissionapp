/** Small controlled inputs. No <form> tags anywhere — onChange/onClick only (per spec). */

export function TextField(props: {
  label: string; value: string | null; onChange: (v: string) => void;
  required?: boolean; maxLength?: number; multiline?: boolean;
}) {
  const { label, value, onChange, required, maxLength, multiline } = props;
  return (
    <label className="field">
      <span className="field-label">{label}{required ? <span className="req">*</span> : null}</span>
      {multiline ? (
        <textarea
          className="textarea"
          value={value ?? ''} maxLength={maxLength} rows={4}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input"
          type="text" value={value ?? ''} maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function YearField(props: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  const { label, value, onChange } = props;
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="input input--year"
        type="number" min={1900} max={2100} value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
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
    <label className="field">
      <span className="field-label">{label}{required ? <span className="req">*</span> : null}</span>
      <select
        className="select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
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
    <div className="field chips-group">
      <span className="field-label">{label}</span>
      <div className="chips">
        {options.map((o) => {
          const on = selected.has(o);
          return (
            <label key={o} className={on ? 'chip chip--on' : 'chip'}>
              <input type="checkbox" checked={on} onChange={() => toggle(o)} />
              <span className="dot" aria-hidden="true" />
              {o}
            </label>
          );
        })}
      </div>
    </div>
  );
}
