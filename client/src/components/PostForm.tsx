import { useState, type FormEvent } from 'react';
import { getErrorMessage, isApiError, type FieldErrors } from '../types';
import { Alert } from './Alert';
import { Spinner } from './Spinner';

export interface PostValues {
  title: string;
  content: string;
}

interface PostFormProps {
  initialValues?: PostValues;
  submitLabel: string;
  onSubmit: (values: PostValues) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Shared by "Create Post" and "Edit Post".
 *
 * Validation lives on the server, so this form simply renders whatever field
 * errors come back in the 400 response. That keeps one set of rules.
 */
export function PostForm({
  initialValues = { title: '', content: '' },
  submitLabel,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [values, setValues] = useState<PostValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(getErrorMessage(error));
      if (isApiError(error)) {
        setFieldErrors(error.fieldErrors);
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <div>
        <label className="label" htmlFor="post-title">
          Title
        </label>
        <input
          id="post-title"
          type="text"
          value={values.title}
          onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="A clear, specific title"
          disabled={isSubmitting}
          aria-invalid={fieldErrors.title ? true : undefined}
          className={`input ${fieldErrors.title ? 'input-invalid' : ''}`}
        />
        {fieldErrors.title ? (
          <p className="mt-1.5 text-xs text-red-600">{fieldErrors.title}</p>
        ) : null}
      </div>

      <div>
        <label className="label" htmlFor="post-content">
          Content
        </label>
        <textarea
          id="post-content"
          rows={14}
          value={values.content}
          onChange={(event) => setValues((prev) => ({ ...prev, content: event.target.value }))}
          placeholder="Write your post here..."
          disabled={isSubmitting}
          aria-invalid={fieldErrors.content ? true : undefined}
          className={`input resize-y font-sans leading-relaxed ${fieldErrors.content ? 'input-invalid' : ''}`}
        />
        <div className="mt-1.5 flex items-center justify-between">
          {fieldErrors.content ? (
            <p className="text-xs text-red-600">{fieldErrors.content}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-slate-400">{values.content.length} characters</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>

        {onCancel ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}