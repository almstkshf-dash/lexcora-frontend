'use client'
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    Info as InfoIcon, 
    Building2, 
    Users, 
    UserCog, 
    TrendingUp, 
    CalendarDays, 
    FileText, 
    Gavel, 
    Bell, 
    ListTodo,
    StickyNote
} from "lucide-react"
import Court from "./court/Court"
import Employees from "./employees/Employees"
import Stages from "./stages/Stages"
import Sessions from "./sessions/Sessions"
import Petitions from "./petitions/Petitions"
import Executions from "./executions/Executions"
import Notifications from "./notifications/Notifications"
import Info from "./info/Info"
import Parties from "./parties/Parties"
import { useParams } from "next/navigation"
import { FormikProvider } from "./info/FormikContext"
import { getCaseById } from "@/app/services/api/cases"
import Tasks from "./tasks/Tasks"
import Memos from "./memos/Memos"
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import CaseAssistantLauncher from "@/app/components/ai/CaseAssistantLauncher"
function Page() {
    const { id } = useParams();
    const { t} = useTranslations();
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [caseData, setCaseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fetch case data when component mounts or id changes
    useEffect(() => {
        const fetchCaseData = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                
                const response = await getCaseById(id);
                
                if (response.success && response.data) {
                    setCaseData(response.data);
                } else {
                    setError('Failed to fetch case data');
                }
            } catch (err) {
                // Store the full error object to check status code later
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCaseData();
    }, [id]);
    
    const tabs =[
        {label: t('caseTabs.info'), value: "info", icon: InfoIcon, Component:<Info caseId={id}/> },
        {label: t('caseTabs.courts'), value: "courts", icon: Building2, Component:<Court caseId={id}/>},
        {label: t('caseTabs.employees'), value: "employees", icon: UserCog, Component:<Employees caseId={id}/>},
        {label: t('caseTabs.parties'), value: "parties", icon: Users, Component:<Parties caseId={id}/>},
        {label: t('caseTabs.stages'), value: "stages", icon: TrendingUp, Component:<Stages caseId={id}/>},
        {label: t('caseTabs.sessions'), value: "sessions", icon: CalendarDays, Component:<Sessions caseId={id}/>},
        {label: t('caseTabs.petitions'), value: "petitions", icon: FileText, Component:<Petitions caseId={id}/>},
        {label: t('caseTabs.executions'), value: "executions", icon: Gavel, Component:<Executions caseId={id}/>},
        {label: t('caseTabs.notifications'), value: "notifications", icon: Bell, Component:<Notifications caseId={id}/>},
        {label: t('caseTabs.tasks'), value: "tasks", icon: ListTodo, Component:<Tasks caseId={id}/>},
        {label: t('caseTabs.memos'), value: "memos", icon: StickyNote, Component:<Memos caseId={id}/>},
    ];
    
    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'تحميل بيانات القضية...' : 'Loading case data...'}
                    </p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        // Check if it's a permission error (403)
        const isPermissionError = error?.response?.status === 403;
        const errorTitle = isPermissionError 
            ? (language === 'ar' ? 'غير مصرح' : 'Unauthorized')
            : (language === 'ar' ? 'خطأ' : 'Error');
        const errorMessage = isPermissionError 
            ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لعرض تفاصيل هذه القضية' : 'You do not have permission to view this case details'))
            : (error?.message || (language === 'ar' ? 'حدث خطأ أثناء تحميل بيانات القضية' : 'Failed to load case data'));
        
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="text-center max-w-md mx-auto">
                    <div className="bg-destructive/10 text-destructive rounded-lg p-6 border border-destructive/20">
                        <p className="mb-2 font-semibold text-lg">{errorTitle}</p>
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    // Don't render FormikProvider until we have data
    if (!caseData) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="text-center">
                    <p className="text-muted-foreground">
                        {language === 'ar' ? 'لا توجد بيانات متاحة' : 'No case data available'}
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <FormikProvider caseId={id} caseData={caseData}>
            <div className="w-full h-full space-y-3">
                <CaseAssistantLauncher caseId={id} />
                <Tabs dir={isRTL ? "rtl" : "ltr"} defaultValue="info" className="w-full h-full">
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b pb-2 md:pb-3 mb-4">
                        <TabsList className="w-full md:w-auto shadow-sm">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger 
                                        className='px-2 sm:px-3 md:px-4 gap-1.5 md:gap-2' 
                                        key={tab.value} 
                                        value={tab.value}
                                    >
                                        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>
                    <div className="px-1 md:px-2">
                        {tabs.map((tab) => (
                            <TabsContent 
                                key={tab.value} 
                                value={tab.value}
                                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                            >
                                {tab.Component}
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </FormikProvider>
    )
}

export default Page
