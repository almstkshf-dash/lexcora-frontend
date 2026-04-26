import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Settings, 
  Info,
  Clipboard,
  User,
  Calendar,
  FileText,
  Bell,
  CheckCheck
} from 'lucide-react'

/**
 * Get icon component based on notification type
 */
export const getTypeIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-emerald-500" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    case 'error':
      return <XCircle className="h-5 w-5 text-rose-500" />
    case 'system':
      return <Settings className="h-5 w-5 text-slate-500" />
    default:
      return <Info className="h-5 w-5 text-sky-500" />
  }
}

/**
 * Get icon component based on related type
 */
export const getRelatedIcon = (relatedType) => {
  switch (relatedType) {
    case 'task':
      return <Clipboard className="h-3 w-3" />
    case 'client request':
      return <User className="h-3 w-3" />
    case 'employee':
      return <User className="h-3 w-3" />
    case 'event':
      return <Calendar className="h-3 w-3" />
    case 'memo':
      return <FileText className="h-3 w-3" />
    default:
      return <Bell className="h-3 w-3" />
  }
}

/**
 * Format date to relative time string
 */
export const formatTimeAgo = (dateString, isArabic = false) => {
  if (!dateString) return ''
  
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return isArabic ? 'الآن' : 'Now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return isArabic ? `منذ ${minutes} دقيقة` : `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return isArabic ? `منذ ${hours} ساعة` : `${hours}h ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return isArabic ? `منذ ${days} يوم` : `${days}d ago`
  }
}

/**
 * Play notification sound
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = 0.5
    audio.play().catch(e => console.warn('Audio play failed:', e))
  } catch (err) {
    console.error('Error playing notification sound:', err)
  }
}
