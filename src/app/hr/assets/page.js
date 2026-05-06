"use client"

import React, { useState } from 'react'
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react'
import ExportButtons from '@/components/ui/export-buttons'
import OfficesTab from './OfficesTab'
import ResourcesTab from './ResourcesTab'
import { getAssets } from '@/app/services/api/assets'

function AssetsPage() {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const [activeTab, setActiveTab] = useState('offices')

  // Fetch assets data
  const { data: assetsData, error, mutate, isLoading } = useSWR(
    'assets',
    getAssets
  )

  const assets = assetsData?.data || []
  
  // Filter assets by record_type
  const officeAssets = assets.filter(asset => asset.record_type === 'office')
  const resourceAssets = assets.filter(asset => asset.record_type === 'resource')

  // Column configuration for export
  const assetsColumnConfig = {
    id: {
      ar: 'المعرف',
      en: 'ID',
      dataKey: 'id'
    },
    name: {
      ar: 'الاسم',
      en: 'Name',
      dataKey: 'name'
    },
    record_type: {
      ar: 'نوع السجل',
      en: 'Record Type',
      dataKey: 'record_type',
      formatter: (value) => {
        const typeMap = {
          'office': isArabic ? 'مكتب' : 'Office',
          'resource': isArabic ? 'مورد' : 'Resource'
        }
        return typeMap[value] || value
      }
    },
    description: {
      ar: 'الوصف',
      en: 'Description',
      dataKey: 'description'
    },
    location: {
      ar: 'الموقع',
      en: 'Location',
      dataKey: 'location'
    },
    status: {
      ar: 'الحالة',
      en: 'Status',
      dataKey: 'status',
      type: 'status',
      statusMap: {
        'available': { ar: 'متاح', en: 'Available' },
        'occupied': { ar: 'مشغول', en: 'Occupied' },
        'maintenance': { ar: 'صيانة', en: 'Maintenance' }
      }
    },
    capacity: {
      ar: 'السعة',
      en: 'Capacity',
      dataKey: 'capacity'
    },
    amenities: {
      ar: 'المرافق',
      en: 'Amenities',
      dataKey: 'amenities'
    },
    created_at: {
      ar: 'تاريخ الإنشاء',
      en: 'Created At',
      dataKey: 'created_at',
      type: 'date'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        {t('common.errorLoading')}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('assets.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs dir={isArabic ? 'rtl' : 'ltr'} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="offices">
              {t('assets.offices') || (isArabic ? 'المكاتب' : 'Offices')}
            </TabsTrigger>
            <TabsTrigger value="resources">
              {t('assets.resources') || (isArabic ? 'الموارد' : 'Resources')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offices">
            {/* Export Buttons for Offices */}
            {officeAssets && officeAssets.length > 0 && (
              <div className="mb-4">
                <ExportButtons
                  data={officeAssets}
                  columnConfig={assetsColumnConfig}
                  language={language}
                  exportName="office-assets"
                  sheetName={t('assets.officeAssets') || (isArabic ? 'أصول المكاتب' : 'Office Assets')}
                />
              </div>
            )}
            <OfficesTab offices={officeAssets} onMutate={mutate} />
          </TabsContent>

          <TabsContent value="resources">
            {/* Export Buttons for Resources */}
            {resourceAssets && resourceAssets.length > 0 && (
              <div className="mb-4">
                <ExportButtons
                  data={resourceAssets}
                  columnConfig={assetsColumnConfig}
                  language={language}
                  exportName="resource-assets"
                  sheetName={t('assets.resourceAssets') || (isArabic ? 'أصول الموارد' : 'Resource Assets')}
                />
              </div>
            )}
            <ResourcesTab resources={resourceAssets} onMutate={mutate} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AssetsPage
