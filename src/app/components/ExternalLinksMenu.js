"use client"

import React, { useState } from 'react'
import { 
  ExternalLink, 
  X, 
  Trash2, 
  Plus,
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

function ExternalLinksMenu() {
  const { language } = useLanguage()
  const { t } = useTranslations()
  const isArabic = language === 'ar'
  
  const [isOpen, setIsOpen] = useState(false)
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
  const { data: linksData, error, mutate, isLoading } = useSWR(
    'external-links',
    getExternalLinks,
    {
      revalidateOnFocus: true
    }
  )

  const links = linksData?.data || []

  const handleOpenLink = (url) => {
    // Ensure URL has protocol
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`
    
    window.open(formattedUrl, '_blank', 'noopener,noreferrer')
  }

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

  const openDeleteDialog = (linkId, e) => {
    e.stopPropagation()
    setSelectedLinkId(linkId)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            aria-label={t('externalLinks.title')}
          >
            <LinkIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">{t('externalLinks.title')}</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          dir={isArabic ? "rtl" : "ltr"}
          align={isArabic ? "start" : "end"} 
          sideOffset={8}
        >
          <DropdownMenuLabel className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span>{t('externalLinks.title')}</span>
            </div>
            {links.length > 0 && (
              <Badge variant="secondary">{links.length}</Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <ScrollArea className="h-[350px]">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : links.length === 0 ? (
              <div className="p-8 text-center">
                <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t('externalLinks.noLinks')}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="group relative border rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-primary/20"
                  >
                    <div 
                      className="flex items-start gap-3 p-3 pr-12 cursor-pointer bg-card hover:bg-accent/50 transition-colors"
                      onClick={() => handleOpenLink(link.link)}
                    >
                      <div className="mt-0.5 p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground mb-1 truncate">
                          {link.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          {link.link}
                        </p>
                      </div>
                    </div>
                    
                    {/* Delete button - positioned absolutely */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => openDeleteDialog(link.id, e)}
                      aria-label={t('common.delete')}
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{t('common.delete')}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DropdownMenuSeparator />
          
          <div className="p-2">
            <Button 
              className="w-full" 
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('externalLinks.addNew')}
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add New Link Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
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
                required
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('externalLinks.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('externalLinks.confirmDeleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
