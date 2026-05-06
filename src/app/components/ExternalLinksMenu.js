"use client"

import React, { useState, useTransition, useCallback, lazy, Suspense } from 'react'
import { 
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslations } from '@/hooks/useTranslations'
import { 
  getExternalLinks, 
  createExternalLink, 
  deleteExternalLink 
} from '@/app/services/api/externalLinks'
import useSWR from 'swr'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

// Lazy-load the list content
const ExternalLinksList = lazy(() => import('./ExternalLinksList'))

function ExternalLinksMenu() {
  const { language } = useLanguage()
  const { t } = useTranslations()
  const isArabic = language === 'ar'
  
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLinkId, setSelectedLinkId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    link: ''
  })

  // Get current user from Redux
  const { user } = useSelector((state) => state.auth)

  // Fetch external links
  const { data: linksData, mutate, isLoading } = useSWR(
    'external-links',
    getExternalLinks,
    {
      revalidateOnFocus: true
    }
  )

  const links = linksData?.data || []

  const handleOpenChange = useCallback((open) => {
    startTransition(() => {
      setIsOpen(open)
    })
  }, [])

  const handleOpenLink = useCallback((url) => {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`
    
    window.open(formattedUrl, '_blank', 'noopener,noreferrer')
  }, [])

  const handleDelete = async () => {
    if (!selectedLinkId) return

    try {
      setIsSubmitting(true)
      await deleteExternalLink(selectedLinkId)
      toast.success(t('externalLinks.deleteSuccess'))
      mutate()
      setDeleteDialogOpen(false)
      setSelectedLinkId(null)
    } catch (error) {
      toast.error(t('externalLinks.deleteError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.link) {
      toast.error(t('externalLinks.fillAllFields'))
      return
    }

    try {
      setIsSubmitting(true)
      await createExternalLink({
        title: formData.title,
        link: formData.link,
        created_by: user?.id
      })
      
      toast.success(t('externalLinks.createSuccess'))
      mutate()
      setIsDialogOpen(false)
      setFormData({ title: '', link: '' })
    } catch (error) {
      toast.error(t('externalLinks.createError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteDialog = useCallback((linkId, e) => {
    e.stopPropagation()
    setSelectedLinkId(linkId)
    setDeleteDialogOpen(true)
  }, [])

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-all duration-300"
            aria-label={t('externalLinks.title')}
          >
            <LinkIcon className={`h-5 w-5 transition-transform duration-300 ${isPending ? 'opacity-50' : ''}`} aria-hidden="true" />
            <span className="sr-only">{t('externalLinks.title')}</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          dir={isArabic ? "rtl" : "ltr"}
          align={isArabic ? "start" : "end"} 
          sideOffset={8}
          className="w-[320px] p-0 overflow-hidden rounded-2xl shadow-2xl border-border/50 bg-background/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <Suspense fallback={
            <div className="p-8 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }>
            {isOpen && (
              <ExternalLinksList
                isArabic={isArabic}
                t={t}
                links={links}
                isLoading={isLoading}
                handleOpenLink={handleOpenLink}
                openDeleteDialog={openDeleteDialog}
                onAddNew={() => setIsDialogOpen(true)}
              />
            )}
          </Suspense>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl border-border/50 shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{t('externalLinks.addNewLink')}</DialogTitle>
            <DialogDescription>
              {t('externalLinks.addDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('externalLinks.linkTitle')}</Label>
              <Input
                id="title"
                placeholder={t('externalLinks.titlePlaceholder')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isSubmitting}
                className="rounded-xl border-border/50 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">{t('externalLinks.linkUrl')}</Label>
              <Input
                id="link"
                type="url"
                placeholder={t('externalLinks.urlPlaceholder')}
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                disabled={isSubmitting}
                className="rounded-xl border-border/50 focus:ring-primary/20"
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl">
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-border/50 shadow-2xl backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('externalLinks.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('externalLinks.confirmDeleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isSubmitting} className="rounded-xl">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {isSubmitting ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ExternalLinksMenu
