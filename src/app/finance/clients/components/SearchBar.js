import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card.jsx";
import ExportButtons from "@/components/ui/export-buttons";


export default function SearchBar({
  searchTerm,
  onSearchChange,
  isRefreshing,
  exportData,
  exportColumnConfig,
  language,
  placeholder,
  hasData,
  exportName = "export_data",
  sheetName = "Sheet1",
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute inset-inline-start-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 w-full ps-10 pe-10"
            aria-busy={isRefreshing}
          />
          {isRefreshing && (
            <Loader2 className="absolute inset-inline-end-3 top-1/2 h-4 w-4 -translate-y-1/2 transform animate-spin text-blue-500" />
          )}
        </div>
        {hasData && (
          <ExportButtons
            data={exportData}
            columnConfig={exportColumnConfig}
            language={language}
            exportName={exportName}
            sheetName={sheetName}
          />
        )}
      </CardContent>
    </Card>
  );
}

