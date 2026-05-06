"use client"

import React from 'react'
import { 
  ExternalLink, 
  Trash2, 
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

function ExternalLinksList({ 
  isArabic, 
  t, 
  links, 
  isLoading, 
  handleOpenLink, 
  openDeleteDialog, 
  onAddNew
}) {
  return (
    <>
      <DropdownMenuLabel className="flex items-center justify-between p-4">
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
          onClick={onAddNew}
        >
          <span>{t('externalLinks.addNew')}</span>
        </Button>
      </div>
    </>
  )
}

export default ExternalLinksList
