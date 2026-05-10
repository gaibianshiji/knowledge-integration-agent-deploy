import React, { useState } from 'react'
import axios from 'axios'

export default function RAGQuery({ apiBase }) {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleQuery = async () => {
    if (!question.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(`${apiBase}/rag/query?question=${encodeURIComponent(question)}`)
      setResult(res.data)
    } catch (e) {
      console.error('RAG查询失败:', e)
      alert('查询失败: ' + (e.response?.data?.detail || e.message))
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuery()
    }
  }

  return (
    <div>
      <div className="rag-input">
        <input
          type="text"
          placeholder="输入问题，如：什么是炎症反应？"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleQuery} disabled={loading}>
          {loading ? '查询中...' : '查询'}
        </button>
      </div>

      {loading && <div className="loading">正在检索知识库...</div>}

      {result && (
        <div className="rag-answer">
          <div className="answer-text">
            {result.answer.split('\n').map((line, i) => (
              <p key={i} style={{ marginBottom: '8px' }}>{line}</p>
            ))}
          </div>

          {result.citations && result.citations.length > 0 && (
            <>
              <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                引用来源
              </h4>
              {result.citations.map((cite, i) => (
                <div key={i} className="citation">
                  <span className="source">
                    [{cite.textbook}] {cite.chapter} - 第{cite.page}页
                  </span>
                  <span className="score">
                    相关度: {(cite.relevance_score * 100).toFixed(0)}%
                  </span>
                  {cite.content_preview && (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {cite.content_preview}...
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="empty-state" style={{ height: 'auto', padding: '40px 0' }}>
          <p style={{ fontSize: '13px' }}>基于教材内容的精准问答</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>每个回答都会附带原文来源引用</p>
        </div>
      )}
    </div>
  )
}
