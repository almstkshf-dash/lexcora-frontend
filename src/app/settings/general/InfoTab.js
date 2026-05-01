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

function InfoTab() {
  return (
 <TabsContent value="info">
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle>معلومات الشركة</CardTitle>
                </div>
                <CardDescription>اسم الشركة، رقم الهاتف، والعنوان</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اسم الشركة</Label>
                    <Input  />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    <Input   />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>العنوان</Label>
                  <Textarea rows={3} />
                </div>

                <Separator />

                <div className="flex items-center justify-end">
                  <Button  className="min-w-[120px]">
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

export default InfoTab