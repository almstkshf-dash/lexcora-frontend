
import React from 'react'
import useSWR from 'swr'
import { getCaseParties } from '@/app/services/api/parties'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslations } from '@/hooks/useTranslations'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash, Eye, Plus, Files } from 'lucide-react'
import AddPartyToTableModal from "./components/AddPartyToTableModal"
import DeletePartyModal from "./components/DeletePartyModal"
import PartyDocumentsModal from "./components/PartyDocumentsModal"

function Parties({ caseId }) {
  const { language } = useLanguage()
  const { t } = useTranslations()
  
  // Fetch case parties using SWR
  const { data: partiesResponse, error, isLoading, mutate } = useSWR(
    caseId ? `case-parties-${caseId}` : null,
    () => getCaseParties(caseId)
  )

  const parties = Array.isArray(partiesResponse?.data) ? partiesResponse.data : []

  // Function to translate party type using the translation system
  const translatePartyType = (type) => {
    return t(`parties.${type}`) || type
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('parties.title') || 'Case Parties'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">{t('parties.loading') || 'Loading...'}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('parties.title') || 'Case Parties'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-destructive">{t('parties.loadingError') || 'Error occurred while loading parties'}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('parties.title') || 'Case Parties'}</span>
          <AddPartyToTableModal 
            caseId={caseId}
            onPartyAdded={() => mutate()}
          >
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 ml-2" />
              {t('parties.addNewParty') || 'Add New Party'}
            </Button>
          </AddPartyToTableModal>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {parties.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-8">
            <div className="text-muted-foreground mb-4">{t('parties.noPartiesAdded') || 'No parties added to case yet'}</div>
            <AddPartyToTableModal 
              caseId={caseId}
              onPartyAdded={() => mutate()}
            >
              <Button variant="outline">
                <Plus className="h-4 w-4 ml-2" />
                {t('parties.addNewParty') || 'Add New Party'}
              </Button>
            </AddPartyToTableModal>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('parties.partyName') || 'Name'}</TableHead>
                <TableHead>{t('parties.partyType') || 'Type'}</TableHead>
                <TableHead>{t('parties.phone') || 'Phone Number'}</TableHead>
                <TableHead>{t('parties.address') || 'Address'}</TableHead>
                <TableHead>{t('parties.nationality') || 'Nationality'}</TableHead>
                <TableHead className="w-[100px]">{t('parties.actions') || 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parties.map((party) => (
                <TableRow key={party.case_party_id}>
                  <TableCell className="font-medium">{party.party_name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {translatePartyType(party.type)}
                    </span>
                  </TableCell>
                  <TableCell>{party.phone}</TableCell>
                  <TableCell>{party.address}</TableCell>
                  <TableCell>{party.nationality}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('parties.openMenu') || 'Open menu'}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <PartyDocumentsModal
                          caseId={caseId}
                          partyId={party.party_id}
                          partyName={party.party_name}
                        >
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer"
                          >
                            <Files className="mr-2 h-4 w-4" />
                            {t('parties.view') || 'View'}
                          </DropdownMenuItem>
                        </PartyDocumentsModal>
                     
                        <DeletePartyModal
                          caseId={caseId}
                          party={party}
                          onPartyDeleted={() => mutate()}
                        >
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive cursor-pointer"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            {t('parties.delete') || 'Delete'}
                          </DropdownMenuItem>
                        </DeletePartyModal>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default Parties