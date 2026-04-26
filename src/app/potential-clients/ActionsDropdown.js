"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Calendar, Trash2 } from "lucide-react";
import DeletePotentialClientModal from "./DeletePotentialClientModal";
import { useTranslations } from "@/hooks/useTranslations";

const ActionsDropdown = ({ 
  client, 
  onViewDetails, 
  onEdit, 
  onAddMeeting,
  onDeleted 
}) => {
  const { t } = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(client.id)}>
          <Eye className="mr-2 h-4 w-4" />
          <span>{t("potentialClientsPage.messages.viewDetails")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(client.id)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>{t("potentialClientsPage.messages.editClient")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddMeeting(client.id)}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>{t("potentialClientsPage.messages.addMeeting")}</span>
        </DropdownMenuItem>
        <DeletePotentialClientModal
          clientId={client.id}
          clientName={client.name}
          onClientDeleted={onDeleted}
        >
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>{t("potentialClientsPage.messages.deleteClient") || "Delete"}</span>
          </DropdownMenuItem>
        </DeletePotentialClientModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionsDropdown;
