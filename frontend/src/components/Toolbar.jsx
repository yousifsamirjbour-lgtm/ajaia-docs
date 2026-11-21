import React from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Pilcrow,
  List,
  ListOrdered
} from 'lucide-react'

export default function Toolbar({ editor }) {
  if (!editor) {
    return null
  }

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Editor Formatting Toolbar">
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`btn-tool ${editor.isActive('bold') ? 'is-active' : ''}`}
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`btn-tool ${editor.isActive('italic') ? 'is-active' : ''}`}
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`btn-tool ${editor.isActive('underline') ? 'is-active' : ''}`}
          title="Underline (Ctrl+U)"
          aria-label="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
      </div>

      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`btn-tool ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
          title="Heading 1"
          aria-label="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`btn-tool ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          title="Heading 2"
          aria-label="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`btn-tool ${editor.isActive('paragraph') ? 'is-active' : ''}`}
          title="Paragraph"
          aria-label="Paragraph"
        >
          <Pilcrow size={16} />
        </button>
      </div>

      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn-tool ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          title="Bullet List"
          aria-label="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`btn-tool ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          title="Numbered List"
          aria-label="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>
    </div>
  )
}
