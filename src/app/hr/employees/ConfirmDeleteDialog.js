import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

export default function ConfirmDeleteDialog({ trigger, onConfirm }) {
  const { t } = useTranslations();
  
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg text-center font-bold">
            {t('admins.confirmDelete')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-end">{t('admins.confirmDeleteMessage')}</div>
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              {t('buttons.cancel')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              {t('buttons.delete')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

