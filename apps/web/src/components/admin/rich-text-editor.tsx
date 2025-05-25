"use client"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
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
  ImageIcon
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import FileUpload from "./file-upload"
import { useMutation } from "@tanstack/react-query"
import { trpc } from "@/utils/trpc"

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

  const [previousContent, setPreviousContent] = useState('');

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
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return;
    setShowImageUpload(true);
  }, [editor]);

  const [showImageUpload, setShowImageUpload] = useState(false);

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
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={addImage}
          title="Add Image"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent 
        editor={editor} 
        className="bg-background [&_.ProseMirror]:p-3 [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:leading-tight [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-2 [&_.ProseMirror_li]:my-1 [&_.ProseMirror_p]:my-2 [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a:hover]:no-underline [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-2"
        placeholder={placeholder}
      />

      {showImageUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <FileUpload
              category="blog"
              onChange={handleImageUpload}
              label="Select or upload an image"
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowImageUpload(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 