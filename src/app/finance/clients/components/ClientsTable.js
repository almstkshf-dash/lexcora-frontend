import { Eye, User, DollarSign, Phone, Flag, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card.jsx";

/**
 * ClientsTable component displays finance clients in a table format
 * @param {Object} props
 * @param {Array} props.clients - Array of client data
 * @param {Function} props.onViewClient - Callback when view button is clicked
 * @param {Object} props.translations - Translation object
 */
export default function ClientsTable({ clients, onViewClient, translations: t }) {
  if (!clients || clients.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 " />
                      {t("name")}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 " />
                      {t("balance")}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 " />
                      {t("phone")}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 " />
                      {t("nationality")}
                    </div>
                  </TableHead>
                  <TableHead className="text-center">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-12 w-12 " />
                      <p className="">{t("noData")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="">
                <TableHead>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 " />
                    {t("name")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 " />
                    {t("balance")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 " />
                    {t("phone")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 " />
                    {t("nationality")}
                  </div>
                </TableHead>
                <TableHead className="text-center">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold ${
                        client.balance > 0
                          ? "text-green-600"
                          : client.balance < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {client.balance || 0}
                    </span>
                  </TableCell>
                  <TableCell className="">{client.phone || "-"}</TableCell>
                  <TableCell className="">{client.nationality || "-"}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewClient(client)}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      <Eye className="h-4 w-4 me-2" />
                      {t("view")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

