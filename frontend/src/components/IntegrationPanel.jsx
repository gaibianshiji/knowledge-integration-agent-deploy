import React from 'react'

export default function IntegrationPanel({ onRunIntegration, integrationResult, loading, selectedNode }) {
  return (
    <div>
      {selectedNode && (
        <div className="node-detail">
          <h4>{selectedNode.name}</h4>
          <span className="category">{selectedNode.category}</span>
          <p>{selectedNode.definition}</p>
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <div>教材：{selectedNode.textbook_name}</div>
            <div>章节：{selectedNode.chapter}</div>
            {selectedNode.page && <div>页码：第{selectedNode.page}页</div>}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <button
          className="btn btn-primary"
          onClick={onRunIntegration}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? '整合中...' : '执行跨教材整合'}
        </button>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
          语义对齐 → 去重提纯 → 压缩至30%
        </p>
      </div>

      {integrationResult && (
        <>
          <h4 style={{ fontSize: '13px', marginBottom: '12px' }}>整合统计</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="value">{integrationResult.stats?.original || 0}</div>
              <div className="label">原始知识点</div>
            </div>
            <div className="stat-card">
              <div className="value">{integrationResult.stats?.merged || 0}</div>
              <div className="label">整合后</div>
            </div>
            <div className="stat-card">
              <div className="value">{integrationResult.stats?.decisions_count || 0}</div>
              <div className="label">整合决策</div>
            </div>
            <div className="stat-card">
              <div className="value">
                {integrationResult.stats?.compression_ratio
                  ? `${(integrationResult.stats.compression_ratio * 100).toFixed(0)}%`
                  : '-'}
              </div>
              <div className="label">压缩比</div>
            </div>
          </div>

          {integrationResult.decisions && integrationResult.decisions.length > 0 && (
            <>
              <h4 style={{ fontSize: '13px', marginBottom: '12px' }}>整合决策</h4>
              <div className="decision-list">
                {integrationResult.decisions.map((d, i) => (
                  <div key={i} className="decision-item">
                    <span className={`action ${d.action}`}>{d.action}</span>
                    <div style={{ marginTop: '4px' }}>{d.reason}</div>
                    <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      置信度: {(d.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {!integrationResult && !loading && (
        <div className="empty-state" style={{ height: 'auto', padding: '40px 0' }}>
          <p style={{ fontSize: '13px' }}>跨教材知识整合</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>
            识别重复知识点，合并去重，压缩至30%
          </p>
        </div>
      )}
    </div>
  )
}
