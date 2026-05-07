"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomModal, CustomModalBody, CustomModalFooter } from "@/components/ui/custom-modal";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { toast } from "react-toastify";
import { getInvoiceById, updateInvoice } from "@/app/services/api/invoices";
import { getBranches } from "@/app/services/api/branches";
import { getAllParties } from "@/app/services/api/parties";
import { getAllBankAccounts } from "@/app/services/api/bankAccounts";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import useSWR from "swr";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DEFAULT_VAT, DEFAULT_CURRENCY, STATUS, VAT_CATEGORY, VAT_RATES, EMIRATES, CURRENCY_NAMES } from '@/app/finance/constants';

export default function EditInvoiceModal({ isOpen, onClose, invoiceId, onSuccess }) {
  const t = useTranslations('invoices');
  const { isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [formData, setFormData] = useState({
    client_id: "",
    branch_id: "",
    bank_account_id: "",
    vat: DEFAULT_VAT,
    vat_category: VAT_CATEGORY.STANDARD,
    customer_trn: "",
    currency: DEFAULT_CURRENCY,
    emirate: EMIRATES[1].id,
  });
  const [items, setItems] = useState([{ description: "", amount: "" }]);
  const [loading, setLoading] = useState(false);

  // Fetch branches
  const { data: branchesData } = useSWR(
    isOpen ? "/branches" : null,
    getBranches
  );

  // Fetch clients (parties)
  const { data: clientsData } = useSWR(
    isOpen ? "/parties" : null,
    getAllParties
  );

  // Fetch bank accounts
  const { data: bankAccountsData } = useSWR(
    isOpen ? "/bank-accounts" : null,
    getAllBankAccounts
  );

  const clients = Array.isArray(clientsData?.data) ? clientsData.data : Array.isArray(clientsData) ? clientsData : [];
  const branches = Array.isArray(branchesData?.data) ? branchesData.data : Array.isArray(branchesData) ? branchesData : [];
  const bankAccounts = Array.isArray(bankAccountsData?.data) ? bankAccountsData.data : Array.isArray(bankAccountsData) ? bankAccountsData : [];

  const dropdownsReady = !!branchesData && !!bankAccountsData;

  const loadInvoiceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getInvoiceById(invoiceId);
      
      if (response.success) {
        const invoice = response.data;
        
        setInvoiceDate(invoice.invoice_date ? parseISO(invoice.invoice_date) : new Date());
        setFormData({
          client_id: invoice.client_id?.toString() || "",
          branch_id: invoice.branch_id?.toString() || "",
          bank_account_id: invoice.bank_account_id?.toString() || "",
          vat: invoice.vat?.toString() || DEFAULT_VAT,
          vat_category: invoice.vat_category || VAT_CATEGORY.STANDARD,
          customer_trn: invoice.customer_trn || "",
          currency: invoice.currency || DEFAULT_CURRENCY,
          emirate: invoice.emirate || EMIRATES[1].id,
        });
        
        // Load items
        if (invoice.items && invoice.items.length > 0) {
          setItems(invoice.items.map(item => ({
            description: item.description,
            amount: item.amount.toString()
          })));
        } else {
          setItems([{ description: "", amount: "" }]);
        }
      } else {
        toast.error(t('createError'));
        onClose();
      }
    } catch (error) {

      toast.error(t('createError'));
      onClose();
    } finally {
      setLoading(false);
    }
  }, [invoiceId, t, onClose]);

  // Load invoice data
  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoiceData();
    }
  }, [isOpen, invoiceId, loadInvoiceData]);

  // Calculate total from items with VAT
  const subtotal = items.reduce((sum, item) => {
    return sum + (parseFloat(item.amount) || 0);
  }, 0);
  
  const vatRate = parseFloat(formData.vat) || 0;
  const vatAmount = (subtotal * vatRate) / 100;
  const totalAmount = subtotal + vatAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setItems([...items, { description: "", amount: "" }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!invoiceDate) {
      toast.error(t('pleaseEnterDate'));
      return;
    }

    if (!formData.branch_id) {
      toast.error(t('pleaseSelectBranch'));
      return;
    }

    if (items.length === 0 || items.every(item => !item.description || !item.amount)) {
      toast.error(t('pleaseAddOneItem'));
      return;
    }

    if (totalAmount <= 0) {
      toast.error(t('totalMustBePositive'));
      return;
    }

    // Filter valid items
    const validItems = items.filter(item => item.description && item.amount);

    setIsSubmitting(true);
    try {
      const payload = {
        invoice_date: format(invoiceDate, "yyyy-MM-dd"),
        amount: totalAmount.toFixed(2),
        client_id: formData.client_id || null,
        branch_id: formData.branch_id || null,
        bank_account_id: formData.bank_account_id || null,
        status: STATUS.PENDING,
        vat: parseFloat(formData.vat) || 0,
        vat_category: formData.vat_category,
        customer_trn: formData.customer_trn,
        emirate: formData.emirate,
        currency: formData.currency || DEFAULT_CURRENCY,
        items: validItems,
      };

      const response = await updateInvoice(invoiceId, payload);

      if (response.success) {
        toast.success(t('updateSuccess'));
        onSuccess();
        onClose();
      } else {
        toast.error(response.error || t('updateError'));
      }
    } catch (error) {

      toast.error(error.response?.data?.error || t('updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editInvoice')}
      size="lg"
    >
      {loading || !dropdownsReady ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="me-3">{t('loading')}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <CustomModalBody>
            <div className="space-y-6">
            {/* Invoice Date */}
            <div className="space-y-2">
              <Label htmlFor="invoice_date">{t('invoiceDateRequired')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-start font-normal",
                      !invoiceDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="me-2 h-4 w-4" />
                    {invoiceDate ? format(invoiceDate, "PPP", { locale: ar }) : t('selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={setInvoiceDate}
                    disabled={isSubmitting}
                    initialFocus
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client_id">{t('selectClient')}</Label>
              <SearchableCombobox
                options={clients.map(client => ({
                  value: client.id.toString(),
                  label: client.name
                }))}
                value={formData.client_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                placeholder={t('searchClient')}
                emptyMessage={t('noClientFound')}
                disabled={isSubmitting}
              />
            </div>

            {/* Branch Selection */}
            <div className="space-y-2">
              <Label htmlFor="branch_id">{t('branchRequired')}</Label>
              <Select
                value={formData.branch_id || undefined}
                onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectBranch')} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {isRTL ? branch.name_ar : branch.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bank Account Selection - Optional */}
            <div className="space-y-2">
              <Label htmlFor="bank_account_id">{t('bankAccount')}</Label>
              <Select
                value={formData.bank_account_id || undefined}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bank_account_id: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectBankAccount')} />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.branch_name_en} - {account.bank_name} - {account.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer TRN */}
            <div className="space-y-2">
              <Label htmlFor="customer_trn">{t('customerTrn')}</Label>
              <Input
                id="customer_trn"
                name="customer_trn"
                value={formData.customer_trn}
                onChange={handleInputChange}
                placeholder="100xxxxxxxxxxxx"
                disabled={isSubmitting}
              />
            </div>

            {/* VAT Category, Emirate and Percentage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vat_category">{t('vatCategory')}</Label>
                <Select
                  value={formData.vat_category}
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      vat_category: value,
                      vat: VAT_RATES[value].toString()
                    }));
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VAT_CATEGORY.STANDARD}>{t('vatStandard')}</SelectItem>
                    <SelectItem value={VAT_CATEGORY.ZERO}>{t('vatZero')}</SelectItem>
                    <SelectItem value={VAT_CATEGORY.EXEMPT}>{t('vatExempt')}</SelectItem>
                    <SelectItem value={VAT_CATEGORY.OUT_OF_SCOPE}>{t('vatOutOfScope')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('emirate')}</Label>
                <Select
                  value={formData.emirate}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, emirate: val }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('emirate')} />
                  </SelectTrigger>
                  <SelectContent>
                    {EMIRATES.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {isRTL ? e.ar : e.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vat">{t('vatPercentage')}</Label>
                <Input
                  id="vat"
                  name="vat"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.vat}
                  onChange={handleInputChange}
                  placeholder="5.00"
                  disabled={isSubmitting || formData.vat_category !== VAT_CATEGORY.STANDARD}
                />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">{t('currencyRequired')}</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEFAULT_CURRENCY}>{isRTL ? CURRENCY_NAMES.AED.ar : CURRENCY_NAMES.AED.en} (AED)</SelectItem>
                  {/* <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  <SelectItem value="EUR">يورو (EUR)</SelectItem>
                  <SelectItem value="GBP">جنيه إسترليني (GBP)</SelectItem>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('invoiceDetails')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('addItem')}
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder={t('itemDescription')}
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t('itemAmount')}
                        value={item.amount}
                        onChange={(e) =>
                          handleItemChange(index, "amount", e.target.value)
                        }
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount with VAT breakdown */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-sg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t('subtotal')}</span>
                <span className="font-medium">
                  {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formData.currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{t('vatAmount', { vat: vatRate })}</span>
                <span className="font-medium">
                  {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formData.currency}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{t('total')}</span>
                  <span className="text-2xl font-bold ">
                    {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formData.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CustomModalBody>

        <CustomModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              t('saveChanges')
            )}
          </Button>
        </CustomModalFooter>
      </form>
      )}
    </CustomModal>
  );
}


