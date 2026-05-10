import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

export default function KnowledgeGraph({ data, onNodeSelect, integrationResult }) {
  const svgRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedNodes, setHighlightedNodes] = useState(new Set())

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    svg.selectAll('*').remove()

    const g = svg.append('g')

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const nodeMap = new Map()
    data.nodes.forEach(n => nodeMap.set(n.id, n))

    const validLinks = data.links.filter(l =>
      nodeMap.has(typeof l.source === 'string' ? l.source : l.source.id) &&
      nodeMap.has(typeof l.target === 'string' ? l.target : l.target.id)
    ).map(l => ({
      ...l,
      source: typeof l.source === 'string' ? l.source : l.source.id,
      target: typeof l.target === 'string' ? l.target : l.target.id
    }))

    const linkG = g.append('g')
    const nodeG = g.append('g')

    const link = linkG.selectAll('line')
      .data(validLinks)
      .join('line')
      .attr('stroke', '#3d4266')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6)

    const node = nodeG.selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )

    node.append('circle')
      .attr('r', d => {
        if (highlightedNodes.has(d.id)) return 12
        return d.size || 8
      })
      .attr('fill', d => d.color || '#6366f1')
      .attr('stroke', d => highlightedNodes.has(d.id) ? '#fff' : 'none')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    node.append('text')
      .text(d => d.name)
      .attr('dx', 14)
      .attr('dy', 4)
      .attr('font-size', '11px')
      .attr('fill', '#9ca3af')
      .style('pointer-events', 'none')

    node.on('click', (event, d) => {
      event.stopPropagation()
      onNodeSelect(d)
      setHighlightedNodes(new Set([d.id]))
    })

    node.append('title').text(d => `${d.name}\n${d.definition || ''}`)

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(validLinks).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20))

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    const handleSearch = () => {
      if (!searchTerm) {
        setHighlightedNodes(new Set())
        node.selectAll('circle')
          .attr('r', d => d.size || 8)
          .attr('stroke', 'none')
        return
      }

      const matches = new Set()
      data.nodes.forEach(n => {
        if (n.name.includes(searchTerm) || n.definition?.includes(searchTerm)) {
          matches.add(n.id)
        }
      })
      setHighlightedNodes(matches)

      node.selectAll('circle')
        .attr('r', d => matches.has(d.id) ? 14 : 6)
        .attr('stroke', d => matches.has(d.id) ? '#fbbf24' : 'none')
        .attr('stroke-width', 2)
    }

    window._graphSearch = handleSearch

    return () => {
      simulation.stop()
    }
  }, [data, highlightedNodes])

  useEffect(() => {
    if (window._graphSearch) window._graphSearch()
  }, [searchTerm])

  return (
    <div className="graph-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="搜索知识点..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>

      {data.nodes.length > 0 && (
        <div className="graph-legend">
          <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '12px' }}>图例</div>
          {[...new Set(data.nodes.map(n => n.textbook_name))].slice(0, 7).map((name, i) => {
            const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6']
            return (
              <div key={i} className="legend-item">
                <div className="legend-color" style={{ background: colors[i % colors.length] }}></div>
                <span>{name}</span>
              </div>
            )
          })}
        </div>
      )}

      {data.nodes.length === 0 && (
        <div className="empty-state">
          <div className="icon">🔗</div>
          <p>上传教材并构建知识图谱</p>
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--text-secondary)' }}>
            支持 PDF / Markdown / TXT 格式
          </p>
        </div>
      )}
    </div>
  )
}
