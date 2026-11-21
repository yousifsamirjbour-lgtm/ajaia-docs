import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import {
  Save,
  Share2,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Clock,
  Shield,
  Users
} from 'lucide-react'

import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import ShareModal from './components/ShareModal'
import ImportModal from './components/ImportModal'
import './App.css'

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('ajaia_current_user') || 'alice@ajaia.ai'
  })

  const [myDocuments, setMyDocuments] = useState([])
  const [sharedDocuments, setSharedDocuments] = useState([])
  const [currentDoc, setCurrentDoc] = useState(null)
  const [titleInput, setTitleInput] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'unsaved' | 'error'
  const [saveErrorMsg, setSaveErrorMsg] = useState('')
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isLoadingDoc, setIsLoadingDoc] = useState(false)

  const autoSaveTimerRef = useRef(null)
  const currentDocRef = useRef(null)
  currentDocRef.current = currentDoc

  const titleInputRef = useRef('')
  titleInputRef.current = titleInput

  const loadSeqRef = useRef(0)

  // Headers helper with active user email
  const getAuthHeaders = useCallback((extra = {}) => {
    return {
      'Content-Type': 'application/json',
      'X-User-Email': currentUser,
      ...extra
    }
  }, [currentUser])

  // TipTap Editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => {
      if (!currentDocRef.current) return
      setSaveStatus('unsaved')
      triggerDebouncedAutoSave()
    }
  })

  // Fetch document lists
  const fetchDocuments = useCallback(async (selectDocId = null) => {
    try {
      const res = await fetch('/api/documents', {
        headers: getAuthHeaders()
      })
      if (!res.ok) {
        throw new Error(`Failed to load documents (${res.status})`)
      }
      const data = await res.json()
      setMyDocuments(data.my_documents || [])
      setSharedDocuments(data.shared_documents || [])

      // Auto-select document
      const allDocs = [...(data.my_documents || []), ...(data.shared_documents || [])]
      const hashId = window.location.hash?.replace('#', '')

      if (selectDocId) {
        await loadDocument(selectDocId)
      } else if (!currentDocRef.current) {
        if (hashId && allDocs.some(d => d.id === hashId)) {
          await loadDocument(hashId)
        } else if (allDocs.length > 0) {
          await loadDocument(allDocs[0].id)
        }
      } else {
        // Document already active; verify still accessible
        const exists = allDocs.some(d => d.id === currentDocRef.current.id)
        if (!exists) {
          if (allDocs.length > 0) {
            await loadDocument(allDocs[0].id)
          } else {
            setCurrentDoc(null)
            currentDocRef.current = null
            setTitleInput('')
            titleInputRef.current = ''
            if (editor) editor.commands.setContent('<p></p>')
          }
        }
      }
    } catch (err) {
      console.error('fetchDocuments error:', err)
    }
  }, [currentUser, getAuthHeaders, editor])

  // Load single document
  const loadDocument = async (id) => {
    const seq = ++loadSeqRef.current
    setIsLoadingDoc(true)
    setSaveErrorMsg('')
    try {
      const res = await fetch(`/api/documents/${id}`, {
        headers: getAuthHeaders()
      })
      if (seq !== loadSeqRef.current) return
      if (!res.ok) {
        if (res.status === 403) {
          setSaveErrorMsg('You do not have permission to view this document.')
        } else if (res.status === 404) {
          setSaveErrorMsg('Document not found.')
        }
        setCurrentDoc(null)
        currentDocRef.current = null
        return
      }
      const data = await res.json()
      if (seq !== loadSeqRef.current) return
      setCurrentDoc(data)
      currentDocRef.current = data
      setTitleInput(data.title)
      titleInputRef.current = data.title
      setSaveStatus('saved')
      window.location.hash = data.id

      if (editor) {
        editor.commands.setContent(data.content || '<p></p>')
      }
    } catch (err) {
      if (seq !== loadSeqRef.current) return
      console.error('loadDocument error:', err)
      setSaveErrorMsg(err.message)
    } finally {
      if (seq === loadSeqRef.current) {
        setIsLoadingDoc(false)
      }
    }
  }

  // Reload when currentUser changes
  useEffect(() => {
    localStorage.setItem('ajaia_current_user', currentUser)
    setCurrentDoc(null)
    currentDocRef.current = null
    setTitleInput('')
    titleInputRef.current = ''
    if (editor) editor.commands.setContent('<p></p>')
    fetchDocuments()
  }, [currentUser, fetchDocuments, editor])

  // Save document (manual or auto-save)
  const saveDocument = useCallback(async (customTitle = null) => {
    if (!currentDocRef.current || !editor) return

    const targetTitle = customTitle !== null ? customTitle : (titleInputRef.current || '').trim()
    const targetContent = editor.getHTML()

    setSaveStatus('saving')
    setSaveErrorMsg('')

    try {
      const res = await fetch(`/api/documents/${currentDocRef.current.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: targetTitle || 'Untitled Document',
          content: targetContent
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Save failed (${res.status})`)
      }

      const updated = await res.json()
      setCurrentDoc(updated)
      setSaveStatus('saved')

      // Update in local list without full reload
      setMyDocuments(prev => prev.map(d => d.id === updated.id ? { ...d, title: updated.title, updated_at: updated.updated_at } : d))
      setSharedDocuments(prev => prev.map(d => d.id === updated.id ? { ...d, title: updated.title, updated_at: updated.updated_at } : d))
    } catch (err) {
      console.error('saveDocument error:', err)
      setSaveStatus('error')
      setSaveErrorMsg(err.message)
    }
  }, [editor, titleInput, getAuthHeaders])

  // Debounced auto-save (1200ms)
  const triggerDebouncedAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveDocument()
    }, 1200)
  }, [saveDocument])

  // Title change handler
  const handleTitleChange = (e) => {
    const val = e.target.value.slice(0, 200)
    titleInputRef.current = val
    setTitleInput(val)
    setSaveStatus('unsaved')
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      saveDocument(val)
    }, 1000)
  }

  // Keyboard shortcut Ctrl/Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        saveDocument()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveDocument])

  // Create document
  const handleCreateDoc = async () => {
    setIsLoadingDoc(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: 'Untitled Document',
          content: '<p></p>'
        })
      })
      if (!res.ok) throw new Error('Failed to create document')
      const newDoc = await res.json()
      await loadDocument(newDoc.id)
      await fetchDocuments()
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsLoadingDoc(false)
    }
  }

  // Delete document
  const handleDeleteDoc = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'Untitled Document'}"?`)) {
      return
    }
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to delete document')
      }
      if (currentDoc && currentDoc.id === id) {
        setCurrentDoc(null)
      }
      await fetchDocuments()
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  // Share handler
  const handleShareDoc = async (targetEmail) => {
    if (!currentDoc) return
    const res = await fetch(`/api/documents/${currentDoc.id}/share`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: targetEmail })
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to share document.')
    }

    setCurrentDoc(prev => ({
      ...prev,
      shared_with: data.shared_with || []
    }))
    fetchDocuments()
  }

  // Revoke share handler
  const handleRevokeShare = async (targetEmail) => {
    if (!currentDoc) return
    const res = await fetch(`/api/documents/${currentDoc.id}/share/${encodeURIComponent(targetEmail)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to revoke access.')
    }

    setCurrentDoc(prev => ({
      ...prev,
      shared_with: data.shared_with || []
    }))
    fetchDocuments()
  }

  // Import handler
  const handleImportSuccess = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/documents/import', {
      method: 'POST',
      headers: {
        'X-User-Email': currentUser
      },
      body: formData
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to import document.')
    }

    await fetchDocuments(data.id)
  }

  return (
    <div className="app-container">
      <Sidebar
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        myDocuments={myDocuments}
        sharedDocuments={sharedDocuments}
        selectedDocId={currentDoc?.id}
        onSelectDoc={loadDocument}
        onCreateDoc={handleCreateDoc}
        onOpenImport={() => setIsImportModalOpen(true)}
        onDeleteDoc={handleDeleteDoc}
      />

      <main className="workspace">
        {currentDoc ? (
          <>
            <header className="workspace-header">
              <div className="header-left">
                <div className="title-input-wrapper">
                  <input
                    type="text"
                    className="doc-title-input"
                    value={titleInput}
                    onChange={handleTitleChange}
                    onBlur={() => saveDocument()}
                    placeholder="Document title"
                    maxLength={200}
                    aria-label="Document Title"
                    id="doc-title-input"
                  />
                  <span className="title-char-counter">
                    {titleInput.length}/200
                  </span>
                </div>

                {currentDoc.is_owner ? (
                  <span
                    className="permission-badge owner"
                    title={`Owner: ${currentDoc.owner_email}${currentDoc.shared_with?.length ? ` (Shared with ${currentDoc.shared_with.join(', ')})` : ''}`}
                    id="badge-owner"
                  >
                    <Shield size={12} />
                    <span>Owner</span>
                  </span>
                ) : (
                  <span
                    className="permission-badge shared"
                    title={`Shared by ${currentDoc.owner_email}`}
                    id="badge-shared"
                  >
                    <Users size={12} />
                    <span>Shared by {currentDoc.owner_email.split('@')[0]}</span>
                  </span>
                )}
              </div>

              <div className="header-right">
                {/* Save Status Indicator */}
                <div className={`save-status ${saveStatus}`} id="save-status-indicator">
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle size={14} />
                      <span>Saved</span>
                    </>
                  )}
                  {saveStatus === 'saving' && (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  )}
                  {saveStatus === 'unsaved' && (
                    <>
                      <Clock size={14} />
                      <span>Unsaved</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle size={14} />
                      <span title={saveErrorMsg}>Save Error</span>
                    </>
                  )}
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  className="btn-header"
                  onClick={() => saveDocument()}
                  title="Manual Save (Ctrl+S)"
                  id="btn-save"
                >
                  <Save size={15} />
                  <span>Save</span>
                </button>

                {/* Share Button (Owner only) */}
                {currentDoc.is_owner && (
                  <button
                    type="button"
                    className="btn-header primary"
                    onClick={() => setIsShareModalOpen(true)}
                    id="btn-share"
                  >
                    <Share2 size={15} />
                    <span>Share</span>
                    {currentDoc.shared_with?.length > 0 && (
                      <span style={{
                        background: 'rgba(255,255,255,0.25)',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        marginLeft: '2px'
                      }}>
                        {currentDoc.shared_with.length}
                      </span>
                    )}
                  </button>
                )}

                {/* Delete Button (Owner only) */}
                {currentDoc.is_owner && (
                  <button
                    type="button"
                    className="btn-header danger"
                    onClick={() => handleDeleteDoc(currentDoc.id, currentDoc.title)}
                    title="Delete document"
                    id="btn-delete"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </header>

            {/* Rich Text Toolbar */}
            <Toolbar editor={editor} />

            {/* Editor Workspace */}
            <div
              className="editor-container"
              onClick={() => editor?.chain().focus().run()}
            >
              <div className="editor-inner">
                <EditorContent editor={editor} id="tiptap-editor" />
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            gap: '16px'
          }}>
            {isLoadingDoc ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={24} className="animate-spin" />
                <span>Loading document...</span>
              </div>
            ) : saveErrorMsg ? (
              <div className="modal-alert error" style={{ maxWidth: '400px' }}>
                <AlertCircle size={20} />
                <span>{saveErrorMsg}</span>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '16px', fontWeight: 500 }}>Select a document or create a new one to start writing.</p>
                <button
                  type="button"
                  className="btn-header primary"
                  onClick={handleCreateDoc}
                >
                  Create New Document
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Share Modal */}
      {currentDoc && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          docId={currentDoc.id}
          docTitle={currentDoc.title}
          sharedWith={currentDoc.shared_with || []}
          onShare={handleShareDoc}
          onRevoke={handleRevokeShare}
        />
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  )
}
