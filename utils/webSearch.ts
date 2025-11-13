export interface SearchResult {
  title: string
  url: string
  snippet: string
}

/**
 * Search the web using DuckDuckGo HTML interface (no API key required)
 * Also supports direct URL fetching
 */
export async function searchWeb(query: string): Promise<string> {
  try {
    // If query looks like a URL, fetch it directly
    if (query.match(/^https?:\/\//i)) {
      try {
        const response = await fetch(query, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`)
        }

        const html = await response.text()
        // Extract text content from HTML
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 2000)

        return `Content from ${query}:\n\n${textContent}${textContent.length >= 2000 ? '...' : ''}`
      } catch (error: any) {
        throw new Error(`Failed to fetch URL: ${error.message}`)
      }
    }

    // Use DuckDuckGo HTML search (no API key needed)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    
    // Parse HTML to extract search results - DuckDuckGo HTML structure
    const results: SearchResult[] = []
    
    // Try multiple patterns to extract results
    const patterns = [
      // Modern DuckDuckGo structure
      /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi,
      // Alternative structure
      /<a[^>]*href="([^"]*)"[^>]*class="[^"]*result__a[^"]*"[^>]*>([^<]*)<\/a>/gi,
    ]
    
    const urls: string[] = []
    const titles: string[] = []
    
    // Extract URLs and titles
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(html)) !== null && urls.length < 5) {
        const url = match[1]
        const title = match[2].trim()
        if (url && !urls.includes(url) && title) {
          urls.push(url)
          titles.push(title)
        }
      }
      if (urls.length > 0) break
    }
    
    // Extract snippets
    const snippets: string[] = []
    const snippetPatterns = [
      /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]*)<\/a>/gi,
      /<span[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]*)<\/span>/gi,
    ]
    
    for (const pattern of snippetPatterns) {
      let match
      while ((match = pattern.exec(html)) !== null && snippets.length < 5) {
        const snippet = match[1].trim()
        if (snippet) {
          snippets.push(snippet)
        }
      }
      if (snippets.length > 0) break
    }
    
    // Combine results
    const maxResults = Math.min(urls.length, titles.length, 5)
    for (let i = 0; i < maxResults; i++) {
      results.push({
        title: titles[i] || 'No title',
        url: urls[i] || '',
        snippet: snippets[i] || 'No snippet available',
      })
    }

    // Format results
    if (results.length === 0) {
      return `Web search for "${query}" returned no results. Please try rephrasing your query.`
    }

    let formattedResults = `Web search results for "${query}":\n\n`
    results.forEach((result, index) => {
      formattedResults += `${index + 1}. ${result.title}\n`
      formattedResults += `   URL: ${result.url}\n`
      formattedResults += `   ${result.snippet}\n\n`
    })

    // Add references section
    formattedResults += `\n---\nREFERENCES:\n`
    results.forEach((result, index) => {
      formattedResults += `[${index + 1}] ${result.title}\n   ${result.url}\n`
    })
    formattedResults += `\nWhen using information from these sources, always cite them using [1], [2], etc. format.`

    return formattedResults
  } catch (error: any) {
    console.error('Error searching web:', error)
    throw new Error(`Web search failed: ${error.message}`)
  }
}

