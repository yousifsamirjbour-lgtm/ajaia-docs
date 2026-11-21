import React, { useState } from 'react'
import { X, UserPlus, Trash2, AlertCircle, CheckCircle } from 'lucide-react'

export default function ShareModal({
  isOpen,
  onClose,
  docId,
  docTitle,
  sharedWith = [],
  onShare,
  onRevoke
}) {
  const [emailInput, setEmailInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  const handleShareSubmit = async (e) => {
    e.preventDefault()
    const targetEmail = emailInput.trim()
    if (!targetEmail) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      await onShare(targetEmail)
      setEmailInput('')
      setSuccessMsg(`Document successfully shared with ${targetEmail}`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to share document.')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (targetEmail) => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await onRevoke(targetEmail)
      setSuccessMsg(`Access revoked for ${targetEmail}`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to revoke access.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="share-modal-title" className="modal-title">
            Share "{docTitle}"
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div className="modal-alert error" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="modal-alert info" role="status">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleShareSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              className="modal-input"
              placeholder="Teammate's email (e.g. bob@ajaia.ai)"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              id="btn-modal-share"
              className="btn-header primary"
              disabled={loading || !emailInput.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              <UserPlus size={16} />
              <span>{loading ? 'Sharing...' : 'Share'}</span>
            </button>
          </form>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              People with access ({sharedWith.length})
            </div>

            {sharedWith.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>
                Only you have access to this document.
              </div>
            ) : (
              <div className="shared-users-list">
                {sharedWith.map((email) => (
                  <div key={email} className="shared-user-item">
                    <span className="shared-user-email">{email}</span>
                    <button
                      type="button"
                      className="btn-revoke"
                      onClick={() => handleRevoke(email)}
                      disabled={loading}
                      title={`Revoke access for ${email}`}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-header" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
