"use client"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Link as LinkIcon,
  ImageIcon,
  Youtube as YoutubeIcon,
  Code2 as CodeBlockIcon
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import FileUpload from "./file-upload"
import { useMutation } from "@tanstack/react-query"
import { trpc } from "@/utils/trpc"
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const getFullImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/uploads/')) {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`;
  }
  if (url.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}/api${url}`;
  }
  return url;
};

const extractImageUrls = (html: string): string[] => {
  if (!html) return [];
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    
    return Array.from(images)
      .map(img => img.src)
      .filter(src => src.includes('/api/uploads/') || src.includes('/uploads/'))
      .map(src => {
        if (src.includes('/api/uploads/')) {
          return src.substring(src.indexOf('/api/uploads/'));
        }
        if (src.includes('/uploads/')) {
          return `/api${src.substring(src.indexOf('/uploads/'))}`;
        }
        return src;
      });
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const t = useTranslations();

  const [previousContent, setPreviousContent] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [showCodeBlockModal, setShowCodeBlockModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('');

  const lowlightInstance = createLowlight(common);

  const { mutate: deleteOldImage } = useMutation(
    trpc.upload.deleteImageByUrl.mutationOptions({
      onError: (error: any) => {
        console.warn("Failed to delete old image:", error);
      }
    })
  );

  const handleImageDelete = useCallback((src: string) => {
    console.log('Attempting to delete image:', src);
    if (src.includes('/api/uploads/') || src.includes('/uploads/')) {
      let apiUrl = src;
      if (src.includes('/uploads/') && !src.includes('/api/uploads/')) {
        apiUrl = `/api${src.substring(src.indexOf('/uploads/'))}`;
      }
      if (src.includes('/api/uploads/')) {
        apiUrl = src.substring(src.indexOf('/api/uploads/'));
      }
      
      console.log('Deleting upload path:', apiUrl);
      deleteOldImage({ url: apiUrl });
    }
  }, [deleteOldImage]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
        allowBase64: false,
      }),
      CodeBlockLowlight.configure({
        lowlight: lowlightInstance,
        HTMLAttributes: {
          class: 'hljs rounded-lg bg-gray-100 dark:bg-gray-800 p-4 my-4 overflow-x-auto',
          style: "font-family: 'Hack', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px;",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        autoplay: false,
        controls: true,
        allowFullscreen: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      
      console.log('Content updated');
      console.log('Previous content:', previousContent);
      console.log('New content:', newContent);
      
      const oldImages = extractImageUrls(previousContent);
      const newImages = extractImageUrls(newContent);
      
      console.log('Old images:', oldImages);
      console.log('New images:', newImages);
      
      const deletedImages = oldImages.filter(oldImg => !newImages.includes(oldImg));
      
      console.log('Deleted images:', deletedImages);
      
      deletedImages.forEach(src => {
        console.log('Deleting image:', src);
        handleImageDelete(src);
      });
      
      setPreviousContent(newContent);
      onChange(newContent);
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    setLinkUrl(previousUrl || '')
    setShowLinkModal(true)
  }, [editor])

  const handleLinkSubmit = useCallback(() => {
    if (!editor) return

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    
    setShowLinkModal(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor) return;
    setShowImageUpload(true);
  }, [editor]);

  const addYouTube = useCallback(() => {
    if (!editor) return;
    setYoutubeUrl('')
    setShowYoutubeModal(true)
  }, [editor]);

  const handleYoutubeSubmit = useCallback(() => {
    if (!editor) return;

    if (youtubeUrl === '') {
      setShowYoutubeModal(false)
      return;
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    
    if (!youtubeRegex.test(youtubeUrl)) {
      return;
    }

    editor.chain().focus().setYoutubeVideo({
      src: youtubeUrl,
    }).run();
    
    setShowYoutubeModal(false)
    setYoutubeUrl('')
  }, [editor, youtubeUrl]);

  const addCodeBlock = useCallback(() => {
    if (!editor) return;
    setCodeLanguage('')
    setShowCodeBlockModal(true)
  }, [editor]);

  const handleCodeBlockSubmit = useCallback(() => {
    if (!editor) return;

    if (codeLanguage === '') {
      editor.chain().focus().toggleCodeBlock().run();
    } else {
      editor.chain().focus().toggleCodeBlock({ language: codeLanguage }).run();
    }
    
    setShowCodeBlockModal(false)
    setCodeLanguage('')
  }, [editor, codeLanguage]);

  const handleImageUpload = (url: string) => {
    if (editor && url) {
      const fullUrl = getFullImageUrl(url);
      editor.chain().focus().setImage({ src: fullUrl }).run();
      setShowImageUpload(false);
    }
  };

  useEffect(() => {
    if (content && !previousContent) {
      console.log('Initializing previous content:', content);
      setPreviousContent(content);
    }
  }, [content, previousContent]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log('Setting editor content:', content);
      editor.commands.setContent(content);
      setPreviousContent(content);
    }
  }, [editor, content])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title
  }: { 
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  )

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title={t('richEditor.toolbar.bold')}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title={t('richEditor.toolbar.italic')}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title={t('richEditor.toolbar.strikethrough')}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title={t('richEditor.toolbar.code')}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title={t('richEditor.toolbar.heading1')}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title={t('richEditor.toolbar.heading2')}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title={t('richEditor.toolbar.heading3')}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title={t('richEditor.toolbar.bulletList')}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title={t('richEditor.toolbar.orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title={t('richEditor.toolbar.quote')}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title={t('richEditor.toolbar.addLink')}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={addImage}
          title={t('richEditor.toolbar.addImage')}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={addYouTube}
          title={t('richEditor.toolbar.addYoutube')}
        >
          <YoutubeIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={addCodeBlock}
          title={t('richEditor.toolbar.addCodeBlock')}
        >
          <CodeBlockIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title={t('richEditor.toolbar.undo')}
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title={t('richEditor.toolbar.redo')}
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent 
        editor={editor} 
        className="bg-background [&_.ProseMirror]:p-3 [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:leading-tight [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_ul]:pl-8 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:list-outside [&_.ProseMirror_ol]:pl-8 [&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:list-outside [&_.ProseMirror_li]:my-1 [&_.ProseMirror_p]:my-2 [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a:hover]:no-underline [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-2 [&_.ProseMirror_iframe]:max-w-full [&_.ProseMirror_iframe]:w-full [&_.ProseMirror_iframe]:aspect-video [&_.ProseMirror_iframe]:rounded-lg [&_.ProseMirror_iframe]:my-4 [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_pre_code]:text-sm [&_.ProseMirror_pre_code]:font-mono"
        placeholder={placeholder}
      />

      {/* Image Upload Modal */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.addImage')}</DialogTitle>
            <DialogDescription>
              {t('richEditor.modals.image.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FileUpload
              category="blog"
              onChange={handleImageUpload}
              label={t('fileUpload.selectOrUploadImage')}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageUpload(false)}>
              {t('richEditor.modals.image.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Modal */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('richEditor.modals.link.title')}</DialogTitle>
            <DialogDescription>
              {t('richEditor.modals.link.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-url">{t('richEditor.modals.link.urlLabel')}</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder={t('richEditor.modals.link.urlPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkModal(false)}>
              {t('richEditor.modals.link.cancel')}
            </Button>
            <Button onClick={handleLinkSubmit}>
              {linkUrl ? t('richEditor.modals.link.addLink') : t('richEditor.modals.link.removeLink')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Modal */}
      <Dialog open={showYoutubeModal} onOpenChange={setShowYoutubeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('richEditor.modals.youtube.title')}</DialogTitle>
            <DialogDescription>
              {t('richEditor.modals.youtube.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="youtube-url">{t('richEditor.modals.youtube.urlLabel')}</Label>
              <Input
                id="youtube-url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder={t('richEditor.modals.youtube.urlPlaceholder')}
              />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">{t('richEditor.modals.youtube.supportedFormats')}</p>
                <ul className="list-disc list-inside space-y-1">
                  {t.raw('richEditor.modals.youtube.formats').map((format: string, index: number) => (
                    <li key={index}>{format}</li>
                  ))}
                </ul>
              </div>
              {youtubeUrl && !/^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/.test(youtubeUrl) && (
                <p className="text-sm text-destructive">
                  {t('richEditor.modals.youtube.invalidUrl')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowYoutubeModal(false)}>
              {t('richEditor.modals.youtube.cancel')}
            </Button>
            <Button 
              onClick={handleYoutubeSubmit}
              disabled={!youtubeUrl || !/^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/.test(youtubeUrl)}
            >
              {t('richEditor.modals.youtube.addVideo')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Block Modal */}
      <Dialog open={showCodeBlockModal} onOpenChange={setShowCodeBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('richEditor.modals.codeBlock.title')}</DialogTitle>
            <DialogDescription>
              {t('richEditor.modals.codeBlock.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code-language">{t('richEditor.modals.codeBlock.languageLabel')}</Label>
              <Input
                id="code-language"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                placeholder={t('richEditor.modals.codeBlock.languagePlaceholder')}
              />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">{t('richEditor.modals.codeBlock.popularLanguages')}</p>
                <p>{t('richEditor.modals.codeBlock.languagesList')}</p>
                <p className="mt-2">{t('richEditor.modals.codeBlock.noHighlighting')}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeBlockModal(false)}>
              {t('richEditor.modals.codeBlock.cancel')}
            </Button>
            <Button onClick={handleCodeBlockSubmit}>
              {t('richEditor.modals.codeBlock.addCodeBlock')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 