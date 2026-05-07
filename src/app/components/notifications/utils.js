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
  // Ensure UTC parsing — append Z if no timezone info present
  const normalized = /Z|[+-]\d{2}:?\d{2}$/.test(dateString) ? dateString : dateString + 'Z'
  const date = new Date(normalized)
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
 * Play notification sound using Web Audio API (no file required)
 */
export const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch (err) {
    // Silently ignore if AudioContext is unavailable
  }
}
