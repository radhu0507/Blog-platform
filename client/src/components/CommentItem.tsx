import { useState } from 'react';
import { formatDateTime, getInitials } from '../lib/format';
import * as commentService from '../services/commentService';
import { getErrorMessage } from '../types';
import type { Comment } from '../types';
import { Alert } from './Alert';
import { ConfirmDialog } from './ConfirmDialog';
import { Spinner } from './Spinner';

interface CommentItemProps {
  comment: Comment;
  canManage: boolean;
  onUpdated: (comment: Comment) => void;
  onDeleted: (commentId: string) => void;
}

/** A single comment, with inline editing for its author. */
export function CommentItem({ comment, canManage, onUpdated, onDeleted }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wasEdited = comment.updatedAt !== comment.createdAt;

  function startEditing() {
    setDraft(comment.content);
    setError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setError(null);
  }

  async function saveEdit() {
    setError(null);
    setIsSaving(true);

    try {
      const updated = await commentService.updateComment(comment.id, draft);
      onUpdated(updated);
      setIsEditing(false);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      await commentService.deleteComment(comment.id);
      onDeleted(comment.id);
    } catch (caught) {
      setError(getErrorMessage(caught));
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  }

  return (
    <li className="flex gap-3 py-4">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600"
      >
        {getInitials(comment.author.name)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-slate-800">{comment.author.name}</span>
          <time dateTime={comment.createdAt} className="text-xs text-slate-500">
            {formatDateTime(comment.createdAt)}
          </time>
          {wasEdited ? <span className="text-xs italic text-slate-400">(edited)</span> : null}
        </div>

        {error ? (
          <div className="mt-2">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        {isEditing ? (
          <div className="mt-2">
            <textarea
              rows={3}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={isSaving}
              className="input resize-y font-sans"
              aria-label="Edit comment"
            />
            <div className="mt-2 flex gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={saveEdit} disabled={isSaving}>
                {isSaving ? <Spinner className="h-3.5 w-3.5" /> : null}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEditing} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {comment.content}
            </p>

            {canManage ? (
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={startEditing}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete this comment?"
        message="This cannot be undone."
        busy={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </li>
  );
}