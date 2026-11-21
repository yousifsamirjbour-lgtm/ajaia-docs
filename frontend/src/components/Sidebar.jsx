import React from 'react'
import {
  FileText,
  Plus,
  UploadCloud,
  Users,
  Trash2,
  FileCode
} from 'lucide-react'

const SEEDED_USERS = [
  'alice@ajaia.ai',
  'bob@ajaia.ai',
  'charlie@ajaia.ai'
]

export default function Sidebar({
  currentUser,
  onUserChange,
  myDocuments = [],
  sharedDocuments = [],
  selectedDocId,
  onSelectDoc,
  onCreateDoc,
  onOpenImport,
  onDeleteDoc
}) {
  return (
    <aside className="sidebar" aria-label="Sidebar Navigation">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">A</div>
          <span className="brand-text">Ajaia Docs</span>
          <span className="brand-tag">AI-Native</span>
        </div>

        <div className="user-switcher">
          <label htmlFor="user-select" className="user-switcher-label">
            Active User
          </label>
          <select
            id="user-select"
            className="user-select"
            value={currentUser}
            onChange={(e) => onUserChange(e.target.value)}
          >
            {SEEDED_USERS.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
            {!SEEDED_USERS.includes(currentUser) && (
              <option value={currentUser}>{currentUser}</option>
            )}
          </select>
        </div>
      </div>

      <div className="sidebar-actions">
        <button
          type="button"
          className="btn-sidebar btn-primary-action"
          onClick={onCreateDoc}
          id="btn-new-document"
        >
          <Plus size={16} />
          <span>New Doc</span>
        </button>
        <button
          type="button"
          className="btn-sidebar btn-secondary-action"
          onClick={onOpenImport}
          id="btn-import-document"
        >
          <UploadCloud size={16} />
          <span>Import</span>
        </button>
      </div>

      <div className="sidebar-content">
        {/* Section: My Documents */}
        <div className="section-my-docs">
          <div className="doc-section-title">
            <span>My Documents</span>
            <span className="doc-count-badge">{myDocuments.length}</span>
          </div>

          <div className="doc-list" role="list">
            {myDocuments.length === 0 ? (
              <div className="empty-doc-hint">No documents yet. Create one!</div>
            ) : (
              myDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={`doc-item ${selectedDocId === doc.id ? 'active' : ''}`}
                  onClick={() => onSelectDoc(doc.id)}
                  role="listitem"
                  data-doc-id={doc.id}
                >
                  <div className="doc-item-main">
                    <FileText size={16} color={selectedDocId === doc.id ? '#60a5fa' : '#94a3b8'} />
                    <span className="doc-item-title" title={doc.title}>
                      {doc.title || 'Untitled Document'}
                    </span>
                  </div>
                  {doc.shared_count > 0 && (
                    <span className="doc-item-badge" title={`Shared with ${doc.shared_count} user(s)`}>
                      <Users size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {doc.shared_count}
                    </span>
                  )}
                  <button
                    type="button"
                    className="doc-item-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteDoc(doc.id, doc.title)
                    }}
                    title="Delete document"
                    aria-label={`Delete ${doc.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Shared with Me */}
        <div className="section-shared-with-me">
          <div className="doc-section-title">
            <span>Shared with Me</span>
            <span className="doc-count-badge">{sharedDocuments.length}</span>
          </div>

          <div className="doc-list" role="list">
            {sharedDocuments.length === 0 ? (
              <div className="empty-doc-hint">No shared documents.</div>
            ) : (
              sharedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={`doc-item ${selectedDocId === doc.id ? 'active' : ''}`}
                  onClick={() => onSelectDoc(doc.id)}
                  role="listitem"
                  data-doc-id={doc.id}
                >
                  <div className="doc-item-main">
                    <FileCode size={16} color={selectedDocId === doc.id ? '#34d399' : '#94a3b8'} />
                    <span className="doc-item-title" title={doc.title}>
                      {doc.title || 'Untitled Document'}
                    </span>
                  </div>
                  <span className="doc-item-badge" title={`Owner: ${doc.owner_email}`}>
                    {doc.owner_email.split('@')[0]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
