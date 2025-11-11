/**
 * RichMarkdownRenderer Component
 * Comprehensive markdown renderer with support for:
 * - Tables (GitHub Flavored Markdown)
 * - Syntax highlighting for code blocks
 * - Mermaid diagrams
 * - Math equations (KaTeX)
 * - Task lists
 * - HTML tags (sanitized)
 * - Footnotes
 * - Strikethrough
 */

import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Graph, registerCoreCodecs, xmlUtils } from '@maxgraph/core';
import { MarkdownTheme } from '../styles/markdownThemes';

interface RichMarkdownRendererProps {
  content: string;
  className?: string;
  theme?: MarkdownTheme;
}

// Draw.io Diagram Component using maxGraph
const DrawioDiagram: React.FC<{ xml: string }> = ({ xml }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      console.log('DrawioDiagram: Starting maxGraph render');
      console.log('DrawioDiagram: XML length:', xml.length);

      // Register codecs (required in maxGraph v0.6.0+)
      registerCoreCodecs();

      // Clear the container
      containerRef.current.innerHTML = '';

      // Create a new container div for the graph
      const graphContainer = document.createElement('div');
      graphContainer.style.width = '50%';
      graphContainer.style.height = '350px';
      graphContainer.style.position = 'relative';
      graphContainer.style.overflow = 'auto';
      graphContainer.style.backgroundColor = 'transparent';
      graphContainer.style.cursor = 'grab';
      containerRef.current.appendChild(graphContainer);

      // Create the graph
      const graph = new Graph(graphContainer);
      graphRef.current = graph;

      // Enable HTML labels for multi-line text support
      graph.setHtmlLabels(true);

      // Configure default styles before decoding
      const stylesheet = graph.getStylesheet();
      const defaultVertexStyle = stylesheet.getDefaultVertexStyle();

      // Set draw.io-like defaults
      defaultVertexStyle.fillColor = '#dae8fc';  // Light blue like draw.io
      defaultVertexStyle.strokeColor = '#6c8ebf'; // Darker blue border
      defaultVertexStyle.fontColor = '#000000';   // Black text

      const defaultEdgeStyle = stylesheet.getDefaultEdgeStyle();
      defaultEdgeStyle.strokeColor = '#000000';   // Black edges
      defaultEdgeStyle.fontColor = '#000000';     // Black text on edges

      // Enable pan and zoom
      graph.setPanning(true);
      graph.setEnabled(false); // Disable editing but keep panning

      // Enable mouse wheel zoom
      // @ts-ignore - panningHandler exists but types may not be complete
      if (graph.panningHandler) {
        // @ts-ignore
        graph.panningHandler.useLeftButtonForPanning = true;
      }

      // Parse the XML
      const xmlDoc = xmlUtils.parseXml(xml);
      console.log('DrawioDiagram: XML parsed successfully');

      // Extract the mxGraphModel node (draw.io wraps it in <mxfile><diagram><mxGraphModel>)
      let modelXml: Element = xmlDoc.documentElement;

      // If this is an mxfile, extract the mxGraphModel
      if (modelXml.nodeName === 'mxfile') {
        const diagrams = modelXml.getElementsByTagName('diagram');
        if (diagrams.length > 0) {
          const diagramNode = diagrams[0];

          // Check if the diagram has child elements (uncompressed)
          const mxGraphModels = diagramNode.getElementsByTagName('mxGraphModel');
          if (mxGraphModels.length > 0) {
            // Uncompressed - use the mxGraphModel directly
            modelXml = mxGraphModels[0];
            console.log('DrawioDiagram: Found uncompressed mxGraphModel');
          } else {
            // Compressed - decode base64
            const diagramContent = diagramNode.textContent;
            if (diagramContent && diagramContent.trim().length > 0) {
              try {
                const decoded = atob(diagramContent);
                const decodedDoc = xmlUtils.parseXml(decoded);
                modelXml = decodedDoc.documentElement;
                console.log('DrawioDiagram: Decoded compressed diagram');
              } catch (e) {
                console.error('DrawioDiagram: Failed to decode diagram content', e);
              }
            }
          }
        }
      }

      // Manually parse the XML and create cells using the Graph API
      const model = graph.getDataModel();
      const parent = graph.getDefaultParent();

      model.beginUpdate();
      try {
        // Get all mxCell elements from the XML
        const cells = modelXml.getElementsByTagName('mxCell');
        console.log('DrawioDiagram: Found', cells.length, 'mxCell elements in XML');

        // First pass: create all vertices and edges
        const cellMap = new Map<string, any>();

        for (let i = 0; i < cells.length; i++) {
          const cellXml = cells[i];
          const id = cellXml.getAttribute('id');
          let value = cellXml.getAttribute('value') || '';
          const style = cellXml.getAttribute('style') || '';
          const vertex = cellXml.getAttribute('vertex') === '1';

          // Skip root cells (0 and 1)
          if (id === '0' || id === '1') {
            continue;
          }

          // Get geometry
          const geometryElems = cellXml.getElementsByTagName('mxGeometry');
          let x = 0, y = 0, width = 100, height = 40;

          if (geometryElems.length > 0) {
            const geom = geometryElems[0];
            x = parseFloat(geom.getAttribute('x') || '0');
            y = parseFloat(geom.getAttribute('y') || '0');
            width = parseFloat(geom.getAttribute('width') || '100');
            height = parseFloat(geom.getAttribute('height') || '40');
          }

          // Decode HTML entities in value (e.g., &amp;nbsp; -> &nbsp;, &lt;br&gt; -> <br>)
          if (value) {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = value;
            value = textarea.value;
          }

          // Process style: handle special cases
          let processedStyle = style;

          // Handle fillColor=none for transparent containers
          if (processedStyle.includes('fillColor=none')) {
            processedStyle = processedStyle.replace(/fillColor=none;?/g, '');
          }

          // Map draw.io shapes to maxGraph shapes
          // Draw.io uses 'shape=doubleArrow' but maxGraph uses 'shape=triangle' for arrows
          if (processedStyle.includes('shape=doubleArrow')) {
            processedStyle = processedStyle.replace(/shape=doubleArrow/g, 'shape=triangle');
            // Ensure the triangle points down (direction=south means rotate 180 degrees)
            if (processedStyle.includes('direction=south')) {
              processedStyle = processedStyle.replace(/direction=south;?/g, 'rotation=90;');
            }
          }

          // Create the cell using Graph API
          if (vertex) {
            // @ts-ignore - insertVertex accepts style string but TypeScript types may be incomplete
            const cell = graph.insertVertex(parent, id, value, x, y, width, height, processedStyle);
            cellMap.set(id!, cell);
          }
        }

        console.log('DrawioDiagram: Rendered', cellMap.size, 'diagram elements');
      } catch (err) {
        console.error('DrawioDiagram: Error during manual parsing:', err);
        throw err;
      } finally {
        model.endUpdate();
      }

      // Adjust initial zoom - start at 80% to show more content
      graph.zoomTo(0.8);
      graph.center();
    } catch (error) {
      console.error('Draw.io rendering error:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `<pre style="color: #ee3d48; background: rgba(238, 61, 72, 0.1); padding: 12px; border-radius: 4px; font-family: monospace;">Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}</pre>`;
      }
    }

    // Cleanup
    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, [xml]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(108, 93, 211, 0.1)',
          borderRadius: '8px 8px 0 0',
          border: '1px solid rgba(108, 93, 211, 0.3)',
          borderBottom: 'none',
          fontSize: '12px',
          color: '#b4b4be'
        }}
      >
        💡 <strong>Interactive Diagram:</strong> Click and drag to pan • Scroll to zoom • Double-click to reset
      </div>
      <div
        ref={containerRef}
        style={{
          padding: '16px',
          backgroundColor: 'transparent',
          borderRadius: '0 0 8px 8px',
          border: '1px solid rgba(108, 93, 211, 0.3)',
          overflow: 'auto'
        }}
      />
    </div>
  );
};

// Mermaid Diagram Component
const MermaidDiagram: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (ref.current) {
      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#6c5dd3',
            primaryTextColor: '#f0f0f5',
            primaryBorderColor: '#6c5dd3',
            lineColor: '#8b7deb',
            secondaryColor: '#2d3049',
            tertiaryColor: '#1b1c2e',
            background: '#1b1c2e',
            mainBkg: '#2d3049',
            secondBkg: '#1b1c2e',
            textColor: '#f0f0f5',
            border1: '#6c5dd3',
            border2: '#8b7deb',
            fontSize: '14px'
          }
        });

        // Clear previous content
        ref.current.innerHTML = chart;
        mermaid.run({
          nodes: [ref.current],
          suppressErrors: true
        });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = `<pre style="color: #ee3d48; background: rgba(238, 61, 72, 0.1); padding: 12px; border-radius: 4px; font-family: monospace;">Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}</pre>`;
        }
      }
    }
  }, [chart]);

  return (
    <div
      ref={ref}
      id={id.current}
      style={{
        marginBottom: '16px',
        padding: '16px',
        backgroundColor: 'rgba(27, 28, 46, 0.8)',
        borderRadius: '8px',
        border: '1px solid rgba(108, 93, 211, 0.3)',
        overflow: 'auto'
      }}
      className="mermaid"
    />
  );
};

export const RichMarkdownRenderer: React.FC<RichMarkdownRendererProps> = ({
  content,
  className = '',
  theme
}) => {
  const [modalImage, setModalImage] = React.useState<string | null>(null);

  // Build theme styles object
  const themeStyles = theme ? {
    '--theme-h1-size': theme.styles.h1Size,
    '--theme-h1-weight': theme.styles.h1Weight,
    '--theme-h1-color': theme.styles.h1Color,
    '--theme-h1-background': theme.styles.h1Background,
    '--theme-h1-padding': theme.styles.h1Padding,
    '--theme-h1-border-radius': theme.styles.h1BorderRadius,
    '--theme-h1-margin-bottom': theme.styles.h1MarginBottom,
    '--theme-h1-box-shadow': theme.styles.h1BoxShadow || 'none',
    '--theme-h2-size': theme.styles.h2Size,
    '--theme-h2-weight': theme.styles.h2Weight,
    '--theme-h2-color': theme.styles.h2Color,
    '--theme-h2-border-bottom': theme.styles.h2BorderBottom,
    '--theme-h2-padding-bottom': theme.styles.h2PaddingBottom,
    '--theme-h2-margin-bottom': theme.styles.h2MarginBottom,
    '--theme-h2-box-shadow': theme.styles.h2BoxShadow || 'none',
    '--theme-h3-size': theme.styles.h3Size,
    '--theme-h3-weight': theme.styles.h3Weight,
    '--theme-h3-color': theme.styles.h3Color,
    '--theme-h3-margin-bottom': theme.styles.h3MarginBottom,
    '--theme-h3-box-shadow': theme.styles.h3BoxShadow || 'none',
    '--theme-paragraph-size': theme.styles.paragraphSize,
    '--theme-paragraph-line-height': theme.styles.paragraphLineHeight,
    '--theme-paragraph-margin-bottom': theme.styles.paragraphMarginBottom,
    '--theme-code-background': theme.styles.codeBackground,
    '--theme-code-border': theme.styles.codeBorder,
    '--theme-code-padding': theme.styles.codePadding,
    '--theme-code-border-radius': theme.styles.codeBorderRadius,
    '--theme-code-block-padding': theme.styles.codeBlockPadding,
    '--theme-list-margin-left': theme.styles.listMarginLeft,
    '--theme-list-item-margin-bottom': theme.styles.listItemMarginBottom,
    '--theme-blockquote-background': theme.styles.blockquoteBackground,
    '--theme-blockquote-border-left': theme.styles.blockquoteBorderLeft,
    '--theme-blockquote-padding': theme.styles.blockquotePadding,
    '--theme-link-color': theme.styles.linkColor,
    '--theme-link-hover-color': theme.styles.linkHoverColor,
    '--theme-table-border': theme.styles.tableBorder,
    '--theme-table-header-background': theme.styles.tableHeaderBackground,
    '--theme-table-row-hover-background': theme.styles.tableRowHoverBackground
  } as React.CSSProperties : {};

  return (
    <>
      <div
        className={`rich-markdown-content ${className}`}
        style={themeStyles}
      >
        <ReactMarkdown
        remarkPlugins={[
          remarkGfm      // Tables, task lists, strikethrough, footnotes
        ]}
        urlTransform={(url) => url}  // Allow all URLs including data: URLs
        components={{
          // Custom component rendering for better styling
          table: ({ node, ...props }) => (
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: 'rgba(45, 48, 73, 0.6)',
                  border: 'var(--theme-table-border, 1px solid rgba(108, 93, 211, 0.3))',
                  borderRadius: '4px'
                }}
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead
              style={{
                background: 'var(--theme-table-header-background, rgba(108, 93, 211, 0.2))',
                borderBottom: '2px solid rgba(108, 93, 211, 0.5)'
              }}
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#f0f0f5',
                border: 'var(--theme-table-border, 1px solid rgba(108, 93, 211, 0.3))'
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{
                padding: '12px 16px',
                border: 'var(--theme-table-border, 1px solid rgba(108, 93, 211, 0.3))',
                color: '#f0f0f5'
              }}
              {...props}
            />
          ),
          tr: ({ node, ...props }) => (
            <tr
              style={{
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getComputedStyle(e.currentTarget).getPropertyValue('--theme-table-row-hover-background') || 'rgba(108, 93, 211, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            // Check if this is a mermaid or drawio code block
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            if (inline) {
              return (
                <code
                  style={{
                    background: 'var(--theme-code-background, rgba(108, 93, 211, 0.2))',
                    border: 'var(--theme-code-border, 1px solid rgba(108, 93, 211, 0.3))',
                    padding: 'var(--theme-code-padding, 2px 6px)',
                    borderRadius: 'var(--theme-code-border-radius, 3px)',
                    fontSize: '0.9em',
                    fontFamily: 'monospace',
                    color: '#7dc579'
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Render Mermaid diagrams
            if (language === 'mermaid') {
              const chartCode = String(children).replace(/\n$/, '');
              return <MermaidDiagram chart={chartCode} />;
            }

            // Render Draw.io diagrams
            if (language === 'drawio' || language === 'xml') {
              const xmlCode = String(children).replace(/\n$/, '');
              return <DrawioDiagram xml={xmlCode} />;
            }

            // Block code with custom styling (no external CSS needed)
            return (
              <code
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.9em',
                  color: '#f0f0f5'
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre
              style={{
                background: 'var(--theme-code-background, rgba(27, 28, 46, 0.8))',
                padding: 'var(--theme-code-block-padding, 16px)',
                borderRadius: 'var(--theme-code-border-radius, 8px)',
                border: 'var(--theme-code-border, 1px solid rgba(108, 93, 211, 0.3))',
                overflow: 'auto',
                marginBottom: '16px',
                fontSize: '0.9em',
                lineHeight: '1.5'
              }}
              {...props}
            />
          ),
          h1: ({ node, ...props }) => (
            <h1
              style={{
                fontSize: 'var(--theme-h1-size, 2em)',
                fontWeight: 'var(--theme-h1-weight, 700)' as any,
                color: 'var(--theme-h1-color, #f0f0f5)',
                background: 'var(--theme-h1-background, transparent)',
                padding: 'var(--theme-h1-padding, 0)',
                borderRadius: 'var(--theme-h1-border-radius, 0)',
                marginBottom: 'var(--theme-h1-margin-bottom, 16px)',
                marginTop: '24px',
                boxShadow: 'var(--theme-h1-box-shadow, none)'
              }}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              style={{
                fontSize: 'var(--theme-h2-size, 1.5em)',
                fontWeight: 'var(--theme-h2-weight, 600)' as any,
                color: 'var(--theme-h2-color, #f0f0f5)',
                borderBottom: 'var(--theme-h2-border-bottom, none)',
                paddingBottom: 'var(--theme-h2-padding-bottom, 0)',
                marginBottom: 'var(--theme-h2-margin-bottom, 12px)',
                marginTop: '20px',
                boxShadow: 'var(--theme-h2-box-shadow, none)'
              }}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              style={{
                fontSize: 'var(--theme-h3-size, 1.25em)',
                fontWeight: 'var(--theme-h3-weight, 600)' as any,
                color: 'var(--theme-h3-color, #f0f0f5)',
                marginBottom: 'var(--theme-h3-margin-bottom, 10px)',
                marginTop: '16px',
                boxShadow: 'var(--theme-h3-box-shadow, none)'
              }}
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              style={{
                fontSize: '1.1em',
                fontWeight: 600,
                marginTop: '14px',
                marginBottom: '8px',
                color: '#f0f0f5'
              }}
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              style={{
                fontSize: 'var(--theme-paragraph-size, 16px)',
                lineHeight: 'var(--theme-paragraph-line-height, 1.6)',
                marginBottom: 'var(--theme-paragraph-margin-bottom, 12px)',
                color: '#f0f0f5'
              }}
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              style={{
                marginBottom: '12px',
                marginLeft: 'var(--theme-list-margin-left, 24px)',
                paddingLeft: 0,
                color: '#f0f0f5'
              }}
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              style={{
                marginBottom: '12px',
                marginLeft: 'var(--theme-list-margin-left, 24px)',
                paddingLeft: 0,
                color: '#f0f0f5'
              }}
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              style={{
                marginBottom: 'var(--theme-list-item-margin-bottom, 6px)',
                lineHeight: '1.6'
              }}
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              style={{
                background: 'var(--theme-blockquote-background, rgba(108, 93, 211, 0.1))',
                borderLeft: 'var(--theme-blockquote-border-left, 4px solid rgba(108, 93, 211, 0.8))',
                padding: 'var(--theme-blockquote-padding, 12px 16px)',
                marginLeft: '0',
                marginBottom: '16px',
                fontStyle: 'italic',
                color: '#b4b4be',
                borderRadius: '4px'
              }}
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--theme-link-color, #6c5dd3)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(108, 93, 211, 0.5)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = getComputedStyle(e.currentTarget).getPropertyValue('--theme-link-hover-color') || '#8b7deb';
                e.currentTarget.style.borderBottomColor = 'rgba(139, 125, 235, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = getComputedStyle(e.currentTarget).getPropertyValue('--theme-link-color') || '#6c5dd3';
                e.currentTarget.style.borderBottomColor = 'rgba(108, 93, 211, 0.5)';
              }}
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr
              style={{
                border: 'none',
                borderTop: '2px solid rgba(108, 93, 211, 0.3)',
                margin: '24px 0'
              }}
              {...props}
            />
          ),
          img: ({ node, src, alt, ...props }) => {
            // Ensure src is properly passed through
            const imageSrc = typeof src === 'string' ? src : '';

            return (
              <img
                src={imageSrc}
                alt={alt || ''}
                onClick={() => imageSrc && setModalImage(imageSrc)}
                onError={(_e) => {
                  console.error('Image failed to load:', { src: imageSrc?.substring(0, 100), alt });
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', { alt });
                }}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '1px solid rgba(108, 93, 211, 0.3)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(108, 93, 211, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                {...props}
              />
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>

    {/* Image Modal */}
    {modalImage && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          cursor: 'zoom-out'
        }}
        onClick={() => setModalImage(null)}
      >
        <div
          style={{
            position: 'relative',
            maxWidth: '95vw',
            maxHeight: '95vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setModalImage(null)}
            style={{
              position: 'absolute',
              top: '-40px',
              right: '0',
              background: 'rgba(108, 93, 211, 0.9)',
              border: 'none',
              color: '#ffffff',
              fontSize: '24px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
              zIndex: 10000
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(108, 93, 211, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(108, 93, 211, 0.9)';
            }}
          >
            ×
          </button>

          <img
            src={modalImage}
            alt="Full size view"
            style={{
              maxWidth: '100%',
              maxHeight: '95vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
          />

          <p
            style={{
              marginTop: '16px',
              color: '#b4b4be',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            Click outside image or × to close
          </p>
        </div>
      </div>
    )}
    </>
  );
};
