'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, FileText, Save } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/PageHeader';
import { useLanguage } from '@/contexts/LanguageContext';

function Condiations() {
  return (

        <TabsContent value="condiations">
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>الشروط والأحكام</CardTitle>
                </div>
                <CardDescription>النص العربي والإنجليزي لشروط العقود</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>النص العربي</Label>
                  <Textarea dir="rtl" 
                   rows={8} 
                  />
                </div>

                <div className="space-y-3">
                  <Label>النص الإنجليزي</Label>
                  <Textarea dir="ltr"
                   rows={8} />
                </div>

                <Separator />

                <div className="flex items-center justify-end">
                  <Button 
                   className="min-w-[120px]">
                      <>
                        <Save className="h-4 w-4 mr-2" /> حفظ
                      </>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>  )
}

export default Condiations