interface ArticleContentProps {
  content: string
  className?: string
}

export default function ArticleContent({ content, className = "" }: ArticleContentProps) {
  const baseStyles = "border rounded-lg p-3 bg-background [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:leading-tight [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_li]:break-words [&_p]:my-2 [&_p]:leading-relaxed [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:break-all [&_a]:overflow-wrap-anywhere [&_a:hover]:no-underline [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2"
  
  return (
    <div 
      className={`${baseStyles} ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
} 