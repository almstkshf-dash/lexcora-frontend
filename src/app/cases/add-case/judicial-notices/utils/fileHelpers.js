import { FileText, ImageIcon, FileSpreadsheet, File } from "lucide-react"

/**
 * Get the appropriate icon component based on file extension
 * @param {string} fileName - The name of the file
 * @returns {JSX.Element} The icon component
 */
export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'unknown'
  
  switch (extension) {
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
      return <FileText className="w-4 h-4" />
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return <ImageIcon className="w-4 h-4" />
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="w-4 h-4" />
    default:
      return <File className="w-4 h-4" />
  }
}

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
