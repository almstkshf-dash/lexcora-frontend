"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontSize } from 'tiptap-extension-font-size'
import { Color } from '@tiptap/extension-color'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Type,
  Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguage } from '@/contexts/LanguageContext'

const MenuBar = ({ editor, onPrint, t }) => {
  if (!editor) {
    return null
  }

  const buttonClass = "h-8 w-8 p-0"

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1 rounded-t-md">
      {/* Print & Download */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onPrint}
        className={buttonClass}
        title={t('print')}
      >
        <Printer className="h-4 w-4" />
      </Button>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Undo/Redo */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={buttonClass}
        title={t('undo')}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={buttonClass}
        title={t('redo')}
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Text Formatting */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          buttonClass,
          editor.isActive('bold') && 'bg-gray-200 dark:bg-gray-700'
        )}
        title={t('bold')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          buttonClass,
          editor.isActive('italic') && 'bg-gray-200 dark:bg-gray-700'
        )}
        title={t('italic')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          buttonClass,
          editor.isActive('underline') && 'bg-gray-200 dark:bg-gray-700'
        )}
        title={t('underline')}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Font Size */}
      <select
        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
        value={editor.getAttributes('textStyle').fontSize || '16px'}
        className="h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        title={t('fontSize')}
      >
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
        <option value="28px">28</option>
        <option value="32px">32</option>
        <option value="36px">36</option>
        <option value="48px">48</option>
      </select>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Lists */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          buttonClass,
          editor.isActive('bulletList') && 'bg-gray-200 dark:bg-gray-700'
        )}
        title={t('bulletList')}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          buttonClass,
          editor.isActive('orderedList') && 'bg-gray-200 dark:bg-gray-700'
        )}
        title={t('orderedList')}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Text Alignment */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={cn(
          buttonClass,
          editor.isActive({ textAlign: 'left' }) && 'bg-gray-200 dark:bg-gray-700'
        )}
        title={t('alignLeft')}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={cn(
          buttonClass,
          editor.isActive({ textAlign: 'center' }) && 'bg-gray-200 dark:bg-gray-700'
        )}
        title={t('alignCenter')}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={cn(
          buttonClass,
          editor.isActive({ textAlign: 'right' }) && 'bg-gray-200 dark:bg-gray-700'
        )}
        title={t('alignRight')}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={cn(
          buttonClass,
          editor.isActive({ textAlign: 'justify' }) && 'bg-gray-200 dark:bg-gray-700'
        )}
        title={t('justify')}
      >
        <AlignJustify className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function RichTextEditor({ value, onChange, placeholder, disabled }) {
  const t = useTranslations('richText')
  const { isRTL, language } = useLanguage()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [editor, value])

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor && editor.isEditable === disabled) {
      editor.setEditable(!disabled)
    }
  }, [editor, disabled])

  // Print function — respects active language direction
  const handlePrint = () => {
    const dir = isRTL ? 'rtl' : 'ltr'
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${dir}" lang="${language}">
      <head>
        <title>${t('printTitle')}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            direction: ${dir};
            text-align: ${isRTL ? 'right' : 'left'};
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${editor.getHTML()}
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <div className={cn(
      "border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-900",
      disabled && "opacity-60 cursor-not-allowed"
    )}>
      <MenuBar editor={editor} onPrint={handlePrint} t={t} />
      <EditorContent 
        editor={editor} 
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none p-3 min-h-[150px] focus:outline-none",
          "prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1",
          "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[150px]",
          "[&_.ProseMirror]:focus:outline-none",
          "[&_.ProseMirror]:text-right [&_.ProseMirror]:dir-rtl",
          "[&_.ProseMirror]:text-gray-900 dark:[&_.ProseMirror]:text-gray-100",
          "dark:text-gray-100",
          disabled && "pointer-events-none"
        )}
        placeholder={placeholder}
      />
    </div>
  )
}
