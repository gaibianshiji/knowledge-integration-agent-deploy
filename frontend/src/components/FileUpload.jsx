import React, { useRef } from 'react'

export default function FileUpload({ textbooks, onUpload, onBuildGraph, onBuildAll, loading, graphs }) {
  const fileInputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    for (const file of files) {
      onUpload(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    for (const file of files) {
      onUpload(file)
    }
  }

  return (
    <div className="sidebar-section">
      <h3>教材管理</h3>
      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📚</div>
        <p>拖拽上传或点击选择</p>
        <p style={{ fontSize: '11px', marginTop: '4px' }}>支持 PDF / Markdown / TXT</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.md,.txt,.docx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {textbooks.length > 0 && (
        <>
          <ul className="file-list">
            {textbooks.map(tb => (
              <li key={tb.textbook_id} className="file-item">
                <span className="name" title={tb.filename}>{tb.title}</span>
                <span className={`status ${graphs[tb.textbook_id] ? 'done' : ''}`}>
                  {graphs[tb.textbook_id] ? '已构建' : '待构建'}
                </span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={onBuildAll}
              disabled={loading === 'all-graphs'}
              style={{ flex: 1 }}
            >
              {loading === 'all-graphs' ? '构建中...' : '全部构建'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
