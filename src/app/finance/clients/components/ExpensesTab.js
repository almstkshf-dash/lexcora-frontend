"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Eye, Users, DollarSign, FileText, User, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { getExpensesByClientId } from "@/app/services/api/employeeCashTransactions";
import AddExpenseModal from "./AddExpenseModal";
import EditExpenseModal from "./EditExpenseModal";
import DeleteExpenseModal from "./DeleteExpenseModal";
import ExpenseDetailsModal from "../../employees/components/ExpenseDetailsModal";

export default function ExpensesTab({ clientId, clientName, clientBalance }) {
  const { t } = useTranslations();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [viewExpenseId, setViewExpenseId] = useState(null);

  const { data: expenses, error, isLoading, mutate } = useSWR(
    `/employee-cash-transactions/client/${clientId}/expenses`,
    () => getExpensesByClientId(clientId)
  );

  const handleAddSuccess = () => {
    mutate();
  };

  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const handleViewClick = (expense) => {
    setViewExpenseId(expense.id);
    setIsViewModalOpen(true);
  };

  if (isLoading) {
    return <div className="py-8 text-center">{t("loading")}</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{t("errorLoading")}</div>;
  }

  const expensesList = expenses?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("clientFinance.expenses")}</h3>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 me-2" />
          {t("clientFinance.addExpense")}
        </Button>
      </div>

      {expensesList.length === 0 ? (
        <div className="border rounded-sg p-8 text-center text-gray-500">
          {t("clientFinance.noExpenses")}
        </div>
      ) : (
        <div className="border rounded-sg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t("clientFinance.employeeName")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t("clientFinance.amount")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t("clientFinance.description")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("clientFinance.createdBy")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("clientFinance.createdAt")}
                  </div>
                </TableHead>
                <TableHead className="text-center">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expensesList.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.employee_name || "-"}</TableCell>
                  <TableCell>{expense.amount}</TableCell>
                  <TableCell>{expense.description || "-"}</TableCell>
                  <TableCell>{expense.created_by_name || "-"}</TableCell>
                  <TableCell>
                    {new Date(expense.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewClick(expense)}
                        title={t("clientFinance.view")}
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(expense)}
                        title={t("clientFinance.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(expense)}
                        title={t("clientFinance.delete")}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        clientId={clientId}
        clientName={clientName}
        onSuccess={handleAddSuccess}
      />

      {selectedExpense && (
        <>
          <EditExpenseModal
            clientBalance={clientBalance}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedExpense(null);
            }}
            expense={selectedExpense}
            clientId={clientId}
            clientName={clientName}
            onSuccess={handleAddSuccess}
          />

          <DeleteExpenseModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedExpense(null);
            }}
            expense={selectedExpense}
            onSuccess={handleAddSuccess}
          />
        </>
      )}

      <ExpenseDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewExpenseId(null);
          // Refresh data after modal closes
          mutate();
        }}
        expenseId={viewExpenseId}
      />
    </div>
  );
}


