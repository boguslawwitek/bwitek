"use client"
import { useEffect, useRef, useState } from 'react'
import { useTheme } from "next-themes"
import parse, { type HTMLReactParserOptions, Element } from 'html-react-parser'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface ArticleContentProps {
  content: string
  className?: string
}

export default function ArticleContent({ content, className = "" }: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const preElements = containerRef.current.querySelectorAll('pre code')
      console.log('TipTap HTML structure:')
      preElements.forEach((code, index) => {
        console.log(`Block ${index}:`)
        console.log('- className:', code.className)
        console.log('- textContent:', code.textContent?.substring(0, 100))
        console.log('- parentElement classes:', code.parentElement?.className)
      })
    }
  }, [content])

  const contentStyles = `
    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:leading-tight
    [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3
    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
    [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
    [&_ul]:pl-8 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:list-outside
    [&_ol]:pl-8 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:list-outside
    [&_li]:my-1 [&_li]:break-words
    [&_p]:my-2 [&_p]:leading-relaxed
    [&_strong]:font-semibold [&_em]:italic
    [&_a]:text-primary [&_a]:underline [&_a]:break-all [&_a]:overflow-wrap-anywhere [&_a:hover]:no-underline
    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2
    [&_iframe]:max-w-full [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:my-4
  `.replace(/\s+/g, ' ').trim()

  const defaultContainerStyles = "border rounded-lg p-3 bg-background"

  const allStyles = className ? 
    `article-content ${contentStyles} ${className}` : 
    `article-content ${defaultContainerStyles} ${contentStyles}`

  const isDark = mounted && (resolvedTheme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'))
  const syntaxTheme = isDark ? oneDark : oneLight
  
  const customSyntaxTheme = {
    ...syntaxTheme,
    'pre[class*="language-"]': {
      ...syntaxTheme['pre[class*="language-"]'],
      background: 'transparent',
    },
    'code[class*="language-"]': {
      ...syntaxTheme['code[class*="language-"]'],
      background: 'transparent',
    },
  }

  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        if (domNode.name === 'pre' && domNode.children && domNode.children.length > 0) {
          const codeElement = domNode.children.find(
            (child): child is Element => child instanceof Element && child.name === 'code'
          )
          
          if (codeElement) {
            const className = codeElement.attribs?.class || ''
            const languageMatch = className.match(/(?:language-|hljs\s+language-)([a-zA-Z0-9-]+)/)
            const language = languageMatch ? languageMatch[1] : 'text'
            
            const codeContent = codeElement.children
              ?.map((child) => {
                if (typeof child === 'object' && 'data' in child) {
                  return child.data
                }
                return ''
              })
              .join('') || ''

            return (
              <SyntaxHighlighter
                language={language}
                style={customSyntaxTheme}
                customStyle={{
                  borderRadius: '8px',
                  margin: '16px 0',
                  fontSize: '14px',
                  background: isDark ? '#1e1e1e' : '#f8f9fa',
                  fontFamily: "'Hack', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  padding: '16px',
                }}
                showLineNumbers={false}
                wrapLines={true}
                lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
              >
                {codeContent}
              </SyntaxHighlighter>
            )
          }
        }
        
        if (domNode.name === 'code' && domNode.parent && 'name' in domNode.parent && domNode.parent.name !== 'pre') {
          const codeContent = domNode.children
            ?.map((child) => {
              if (typeof child === 'object' && 'data' in child) {
                return child.data
              }
              return ''
            })
            .join('') || ''

          return (
            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
              {codeContent}
            </code>
          )
        }
      }
    }
  }

  const parsedContent = parse(content, parserOptions)

  return (
    <div
      ref={containerRef}
      className={allStyles}
      suppressHydrationWarning={true}
    >
      {parsedContent}
    </div>
  )
} 