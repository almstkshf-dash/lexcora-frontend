"use client"
import { useEffect, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {  
  Building2, 
  StickyNote, 
  Users, 
  UserCog,
  Scale,
  FileText,
  CalendarDays,
  Gavel,
  Bell,
  ListTodo,
  BookOpen
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from 'react-toastify';
import { useNotify } from "@/hooks/useNotify";
import InlineValidationSummary from "@/components/forms/InlineValidationSummary";
import AutosaveDraftNotice from "./AutosaveDraftNotice";
import { FormikProvider } from "./FormikContext";
import Sessions from "./sessions/sessions";
import Employees from "./employees/Employees";
import CourtAndPoliceStations from "./court/CourtAndPoliceStations";
import Info from "./info/Info";
import Parties from "./parties/Parties";
import Petition from "./petition/Petition";
import Execution from "./execution/Execution";
import JudicialNoticess from "./judicial-notices/JudicialNotices";
import CaseDegrees from "./case-degrees/CaseDegrees";
import Tasks from "./tasks/Tasks";
import SaveCaseButton from "./SaveCaseButton";
import { createCaseWithRelations } from '@/app/services/api/cases';
import Memos from "./memos/Memos";

const BASE_INITIAL_VALUES = {
  branchId: null,
  caseNumber: '',
  fees: '',
  caseTypeId: null,
  caseClassificationId: null,
  policeStationId: null,
  publicProsecutionId: null,
  courtId: null,
  lawyerId: null,
  secretaryId: null,
  legalAdvisorId: null,
  legalResearcherId: null,
  counterCaseId: null,
  counterCaseFileNumbers: [],
  additionalNote: '',
  topic: '',
  is_important: false,
  is_secret: false,
  is_archived: false,
  is_pending: false,
  caseFiles: {
    files: [],
    filesNames: []
  },
  parties: [],
  selectedParties: [],
  caseDegrees: [],
  sessions: [],
  executions: [],
  JudicialNotices: [],
  petition: [],
  litigationStages: [],
  tasks: [],
  memos: [],
  employeeFiles: [],
  courtFiles: [],
  related_cases: [],
  relatedFiles: [],
};

const DRAFT_STORAGE_KEY = "lexcora-add-case-draft";
function AddCasePage() {
  const { t } = useTranslations();
  const notify = useNotify();
  const [initialValuesState, setInitialValuesState] = useState(BASE_INITIAL_VALUES);
  const [restoredAt, setRestoredAt] = useState(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!savedDraft) return;

    try {
      const parsedDraft = JSON.parse(savedDraft);
      if (parsedDraft?.values) {
        setInitialValuesState((prev) => ({
          ...prev,
          ...parsedDraft.values,
        }));
      }
      if (parsedDraft?.savedAt) {
        setRestoredAt(parsedDraft.savedAt);
      }
    } catch (error) {
      console.warn("Unable to read saved draft", error);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async(values, { setSubmitting, setStatus, setFieldError, resetForm }) => {
    setStatus(null);
    setSubmitting(true);
    
    const loadingToast = toast.loading('جاري انشاء قضية...');
    
    try {
      // Prepare case data
      const caseData = {
        case_number: values.caseNumber || null,
        police_station_id: values.policeStationId || null,
        public_prosecution_id: values.publicProsecutionId || null,
        court_id: values.courtId || null,
        lawyer_id: values.lawyerId || null,
        secretary_id: values.secretaryId || null,
        case_classification_id: values.caseClassificationId || null,
        case_type_id: values.caseTypeId || null,
        legal_advisor_id: values.legalAdvisorId || null,
        legal_researcher_id: values.legalResearcherId || null,
        counter_case_id: values.counterCaseId || null,
        fees: values.fees || 0,
        additional_note: values.additionalNote || null,
        topic: values.topic || null,
        branch_id: values.branchId || null,
        is_important: values.is_important || 0,
        is_secret: values.is_secret || 0,
        is_archived: values.is_archived || 0,
        is_pending: values.is_pending || 0,
        related_cases: values.related_cases ? values.related_cases.map(c => c.id) : [],
        files: values.caseFiles || [],
        employeesFiles: values.employeeFiles || [],
        courtFiles: values.courtFiles || [],
        relatedFiles: values.relatedFiles || []
      };

      // Call the batch API endpoint
      const result = await createCaseWithRelations({
        caseData,
        parties: values.parties || [],
        caseDegrees: values.caseDegrees || [],
        petitions: values.petition || [],
        sessions: values.sessions || [],
        executions: values.executions || [],
        judicialNotices: values.JudicialNotices || [],
        tasks: values.tasks || [],
        memos: values.memos || []
      });

      toast.dismiss(loadingToast);
      toast.success('تم انشاء قضية بنجاح');
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setInitialValuesState(BASE_INITIAL_VALUES);
      setRestoredAt(null);

      resetForm({
        values: BASE_INITIAL_VALUES,
        errors: {},
        touched: {},
        status: {
          type: 'success',
          message: 'تم انشاء القضية بنجاح '
        }
      });

    } catch(error){
      toast.dismiss(loadingToast);
      
      const errorMessage = notify.handleApiError(error, 'cases.createFailed')
      setStatus({
        type: 'error',
        message: errorMessage
      });
      
      if (error?.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          setFieldError(field, message);
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Validation schema using Yup
  const validationSchema = Yup.object({
    // caseNumber: Yup.string().required(t('validation.caseNumberRequired') || 'Case number is required'),
    caseTypeId: Yup.string().required(t('validation.caseTypeRequired') || 'Case type is required'),
    caseClassificationId: Yup.string().required(t('validation.caseClassificationRequired') || 'Case classification is required'),
    branchId: Yup.string().required(t('validation.branchRequired') || 'Branch is required'),
    lawyerId: Yup.string().required(t('validation.lawyerRequired') || 'Lawyer is required'),
    legalAdvisorId: Yup.string().required(t('validation.legalAdvisorRequired') || 'Legal advisor is required'),
    secretaryId: Yup.string().required(t('validation.secretaryRequired') || 'Secretary is required'),
    legalResearcherId: Yup.string().required(t('validation.legalResearcherRequired') || 'Legal researcher is required'),
    selectedParties: Yup.array().min(1, t('validation.partiesRequired') || 'At least one party is required'),
    parties: Yup.array(),
    sessions: Yup.array(),
    executions: Yup.array(),
    JudicialNotices: Yup.array(),
    petition: Yup.array(),
    tasks: Yup.array(),
    memos: Yup.array(),
  });

  const accordions = [
    {
      title: t('addCase.basicInfo'),
      content: <Info />,
      icon: <StickyNote className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.courtsAndPolice'),
      content: <CourtAndPoliceStations />,
      icon: <Building2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.team'),
      content: <Employees />,
      icon: <UserCog className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.parties'),
      content: <Parties />,
      icon: <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.initiationProceeding'),
      content: <CaseDegrees />,
      icon: <Scale className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.petition'),
      content: <Petition />,
      icon: <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.sessions'),
      content: <Sessions />,
      icon: <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.execution'),
      content: <Execution />,
      icon: <Gavel className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.judicialNotices'),
      content: <JudicialNoticess />,
      icon: <Bell className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.tasks'),
      content: <Tasks />,
      icon: <ListTodo className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
    {
      title: t('addCase.memos'),
      content: <Memos />,
      icon: <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />,
    },
  ];
  
  return (
    <Formik
      initialValues={initialValuesState}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({ values, errors, touched, isSubmitting, setFieldValue, setFieldTouched, submitForm, validateForm, isValid, status, setTouched }) => (
        <FormikProvider formikProps={{ values, errors, touched, isSubmitting, setFieldValue, setFieldTouched, submitForm }}>
          <Form>
            <div className="pb-24 relative max-w-7xl mx-auto"> {/* Add bottom padding to prevent content being hidden behind sticky button */}
              {/* Status Display */}
              {status && (
                <div className={`mb-4 md:mb-6 p-4 rounded-lg shadow-sm ${status.type === 'error' ? 'bg-destructive/10 border border-destructive/20 text-destructive' : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'}`}>
                  <p className="text-sm font-medium">
                    {status.message}
                  </p>
                </div>
              )}

              <AutosaveDraftNotice
                storageKey={DRAFT_STORAGE_KEY}
                restoredAt={restoredAt}
                className="mb-4"
                onClearDraft={() => setRestoredAt(null)}
              />

              <InlineValidationSummary
                errors={errors}
                title={t("forms.validationSummaryTitle") || "Please fix these fields"}
                hint={t("forms.validationSummaryHint") || "Review the items below to continue."}
                className="mb-4"
              />

              <Accordion type="multiple" defaultValue={[t('addCase.basicInfo')]} className="space-y-2 md:space-y-3">
                {accordions.map((accordion, index) => (
                  <AccordionItem 
                    className="border rounded-lg px-3 md:px-4 bg-card shadow-sm hover:shadow-md transition-shadow" 
                    value={accordion.title} 
                    key={index}
                  >
                    <AccordionTrigger className="hover:no-underline py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        {accordion.icon}
                        <span className="font-semibold text-sm md:text-base">{accordion.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 md:pb-6">
                      {accordion.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {/* Sticky Save Button */}
              <SaveCaseButton 
                onClick={() => {
                }}
                onSubmitForm={submitForm}
                validateForm={validateForm}
                isValid={isValid}
                isLoading={isSubmitting}
                formValues={values}
                setTouched={setTouched}
              />
            </div>
          </Form>
        </FormikProvider>
      )}
    </Formik>
  )
}

export default AddCasePage
