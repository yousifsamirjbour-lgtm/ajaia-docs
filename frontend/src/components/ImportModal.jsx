import React, { useState, useRef } from 'react'
import { X, UploadCloud, FileText, AlertCircle } from 'lucide-react'

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const validateFile = (file) => {
    if (!file) return 'No file selected.'

    const name = file.name.toLowerCase()
    if (!name.endsWith('.md') && !name.endsWith('.txt')) {
      return "Unsupported file type. Only .md and .txt files are supported."
    }

    if (file.size === 0) {
      return "Uploaded file is empty (0 bytes)."
    }

    if (file.size > 1024 * 1024) {
      return "File size exceeds the 1 MB limit."
    }

    return null
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationErr = validateFile(file)
    if (validationErr) {
      setErrorMsg(validationErr)
      setSelectedFile(null)
    } else {
      setErrorMsg('')
      setSelectedFile(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    const validationErr = validateFile(file)
    if (validationErr) {
      setErrorMsg(validationErr)
      setSelectedFile(null)
    } else {
      setErrorMsg('')
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    const validationErr = validateFile(selectedFile)
    if (validationErr) {
      setErrorMsg(validationErr)
      return
    }

    setIsUploading(true)
    setErrorMsg('')

    try {
      await onImportSuccess(selectedFile)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to import document.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="import-modal-title" className="modal-title">
            Import Document
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

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".md,.txt,text/markdown,text/plain"
            style={{ display: 'none' }}
          />

          <div
            className="dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <UploadCloud size={36} className="dropzone-icon" />
            <div className="dropzone-text">
              {selectedFile ? (
                <strong>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</strong>
              ) : (
                <span>Click or drag and drop a file to upload</span>
              )}
            </div>
            <div className="dropzone-hint">
              Supported file types: <strong>.md</strong>, <strong>.txt</strong> (Max 1 MB, UTF-8 text)
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-header" onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-header primary"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Importing...' : 'Import Document'}
          </button>
        </div>
      </div>
    </div>
  )
}
