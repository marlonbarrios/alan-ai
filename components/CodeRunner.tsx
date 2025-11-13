import React, { useState, useRef, useEffect } from 'react'

interface CodeRunnerProps {
  code: string
  language: string
}

export function CodeRunner({ code, language }: CodeRunnerProps) {
  const [showRunner, setShowRunner] = useState(false)
  const [iframeHeight, setIframeHeight] = useState(400)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isResizingRef = useRef(false)

  useEffect(() => {
    if (!showRunner || !iframeRef.current) return

    const iframe = iframeRef.current
    let retryCount = 0
    const maxRetries = 10
    
    // Wait for iframe to be ready, then load content
    const loadContent = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (!iframeDoc) {
          retryCount++
          if (retryCount < maxRetries) {
            setTimeout(loadContent, 100)
            return
          } else {
            console.error('Failed to access iframe document after retries')
            return
          }
        }

        // Determine which libraries to load based on language
        const isP5 = language === 'p5js'
        
        // Create HTML document with appropriate libraries
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${isP5 ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>' : ''}
  ${isP5 ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/addons/p5.sound.min.js"></script>' : ''}
  <style>
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-family: monospace;
      overflow: hidden;
    }
    canvas {
      display: block;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <script>
    try {
      ${code}
      ${isP5 ? `
      // Handle window resize for p5.js
      let resizeTimeout;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
          // p5.js automatically calls windowResized() if it exists in user code
          // If user code uses windowWidth/windowHeight in createCanvas, it will adapt automatically
          // For fixed-size canvases, we try to resize if resizeCanvas is available
          if (typeof windowResized === 'function') {
            // User's windowResized will be called automatically by p5.js
          } else if (typeof resizeCanvas === 'function' && typeof windowWidth !== 'undefined') {
            // Try to resize to new window dimensions
            resizeCanvas(window.innerWidth, window.innerHeight);
          }
        }, 100);
      });
      ` : `
      // Handle window resize for JavaScript
      window.addEventListener('resize', function() {
        // Trigger any resize handlers if they exist
        if (typeof window.onresize === 'function') {
          window.onresize();
        }
        // Dispatch resize event for custom handlers
        window.dispatchEvent(new Event('resize'));
      });
      `}
    } catch (error) {
      console.error('Code execution error:', error);
      document.body.innerHTML = '<div style="color: #ff6b6b; padding: 20px;">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`

        iframeDoc.open()
        iframeDoc.write(html)
        iframeDoc.close()
      } catch (error) {
        console.error('Error executing code:', error)
      }
    }
    
    // Start loading after iframe is mounted
    const timer = setTimeout(loadContent, 200)
    
    return () => clearTimeout(timer)
  }, [showRunner, code, language])

  const runCode = () => {
    if (language !== 'p5js' && language !== 'javascript') {
      return
    }
    setShowRunner(true)
  }

  const openHTMLInNewWindow = () => {
    // Open HTML code directly in a new window
    const newWindow = window.open('', '_blank', 'width=1200,height=800')
    if (newWindow) {
      newWindow.document.write(code)
      newWindow.document.close()
    }
  }

  // Handle window resize to adjust iframe height
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        // Set height based on width (16:9 aspect ratio) with min/max constraints
        const calculatedHeight = Math.max(300, Math.min(800, containerWidth * 0.75))
        setIframeHeight(calculatedHeight)
      }
    }

    if (showRunner) {
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [showRunner])

  // Handle manual resize with drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizingRef.current = true
    const startY = e.clientY
    const startHeight = iframeHeight

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return
      const deltaY = e.clientY - startY
      const newHeight = Math.max(200, Math.min(1000, startHeight + deltaY))
      setIframeHeight(newHeight)
    }

    const handleMouseUp = () => {
      isResizingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const toggleFullscreen = () => {
    if (!iframeRef.current) return

    if (!isFullscreen) {
      // Enter fullscreen
      const iframe = iframeRef.current
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen()
      } else if ((iframe as any).mozRequestFullScreen) {
        (iframe as any).mozRequestFullScreen()
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  const openInNewWindow = () => {
    const isP5 = language === 'p5js'
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${isP5 ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>' : ''}
  ${isP5 ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/addons/p5.sound.min.js"></script>' : ''}
  <style>
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-family: monospace;
      overflow: hidden;
    }
    canvas {
      display: block;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    #fullscreenBtn {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      padding: 8px 12px;
      background: rgba(20, 184, 166, 0.8);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.2s;
    }
    #fullscreenBtn:hover {
      background: rgba(20, 184, 166, 1);
    }
  </style>
</head>
<body>
  <button id="fullscreenBtn" onclick="toggleFullscreen()">⛶ Fullscreen</button>
  <script>
    function toggleFullscreen() {
      var docEl = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
        document.getElementById('fullscreenBtn').textContent = '⛶ Exit Fullscreen';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        document.getElementById('fullscreenBtn').textContent = '⛶ Fullscreen';
      }
    }
    
    // Update button text on fullscreen change
    document.addEventListener('fullscreenchange', function() {
      document.getElementById('fullscreenBtn').textContent = document.fullscreenElement ? '⛶ Exit Fullscreen' : '⛶ Fullscreen';
    });
    document.addEventListener('webkitfullscreenchange', function() {
      document.getElementById('fullscreenBtn').textContent = document.webkitFullscreenElement ? '⛶ Exit Fullscreen' : '⛶ Fullscreen';
    });
    document.addEventListener('mozfullscreenchange', function() {
      document.getElementById('fullscreenBtn').textContent = document.mozFullScreenElement ? '⛶ Exit Fullscreen' : '⛶ Fullscreen';
    });
    document.addEventListener('MSFullscreenChange', function() {
      document.getElementById('fullscreenBtn').textContent = document.msFullscreenElement ? '⛶ Exit Fullscreen' : '⛶ Fullscreen';
    });
    
    try {
      ${code}
      ${isP5 ? `
      // Handle window resize for p5.js
      let resizeTimeout;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
          // p5.js automatically calls windowResized() if it exists in user code
          // If user code uses windowWidth/windowHeight in createCanvas, it will adapt automatically
          // For fixed-size canvases, we try to resize if resizeCanvas is available
          if (typeof windowResized === 'function') {
            // User's windowResized will be called automatically by p5.js
          } else if (typeof resizeCanvas === 'function' && typeof windowWidth !== 'undefined') {
            // Try to resize to new window dimensions
            resizeCanvas(window.innerWidth, window.innerHeight);
          }
        }, 100);
      });
      ` : `
      // Handle window resize for JavaScript
      window.addEventListener('resize', function() {
        // Trigger any resize handlers if they exist
        if (typeof window.onresize === 'function') {
          window.onresize();
        }
        // Dispatch resize event for custom handlers
        window.dispatchEvent(new Event('resize'));
      });
      `}
    } catch (error) {
      console.error('Code execution error:', error);
      document.body.innerHTML = '<div style="color: #ff6b6b; padding: 20px;">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`

    const newWindow = window.open('', '_blank', 'width=800,height=600')
    if (newWindow) {
      newWindow.document.write(html)
      newWindow.document.close()
    }
  }

  // Show different buttons based on language
  const isHTML = language === 'html'
  const isRunnable = language === 'p5js' || language === 'javascript'

  if (!isHTML && !isRunnable) {
    return null
  }

  return (
    <div className="my-2">
      {isHTML && (
        <button
          onClick={openHTMLInNewWindow}
          className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-md font-medium transition-colors"
        >
          🌐 View HTML
        </button>
      )}
      {isRunnable && !showRunner && (
        <button
          onClick={runCode}
          className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-md font-medium transition-colors"
        >
          ▶ Run Code
        </button>
      )}
      {showRunner && (
        <div 
          ref={containerRef}
          className="mt-2 border-2 border-zinc-300 rounded-lg overflow-hidden w-full"
        >
          <div className="bg-zinc-800 text-white px-3 py-2 flex justify-between items-center">
            <span className="text-sm font-medium">Code Output</span>
            <div className="flex gap-2">
              <button
                onClick={toggleFullscreen}
                className="text-xs px-2 py-1 bg-teal-600 hover:bg-teal-700 rounded"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen'}
              </button>
              <button
                onClick={openInNewWindow}
                className="text-xs px-2 py-1 bg-teal-600 hover:bg-teal-700 rounded"
                title="Open in new window"
              >
                🔗 New Window
              </button>
              <button
                onClick={() => {
                  setShowRunner(false)
                }}
                className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
              >
                Close
              </button>
            </div>
          </div>
          <div className="relative">
            <iframe
              ref={iframeRef}
              className="w-full bg-zinc-900"
              title="Code Runner"
              sandbox="allow-scripts allow-same-origin allow-forms"
              style={{ 
                display: 'block',
                height: `${iframeHeight}px`,
                minHeight: '200px',
                maxHeight: '1000px'
              }}
              onLoad={() => {
                // Trigger code execution when iframe loads
                if (showRunner && iframeRef.current) {
                  const iframe = iframeRef.current
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
                  if (iframeDoc && iframeDoc.readyState === 'complete') {
                    // Iframe is ready, code will be executed by useEffect
                  }
                }
              }}
            />
            <div
              onMouseDown={handleMouseDown}
              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-zinc-700 hover:bg-zinc-600 transition-colors flex items-center justify-center group"
              title="Drag to resize"
            >
              <div className="w-12 h-0.5 bg-zinc-500 group-hover:bg-zinc-400"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

