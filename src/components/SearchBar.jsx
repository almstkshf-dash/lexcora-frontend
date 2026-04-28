"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

export function SearchBar({ onSearch, placeholder = "Search..." }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslations();
  const placeholderText = placeholder === "Search..." ? t("searchBar.placeholder") : placeholder;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholderText}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="submit" variant="default">
        {t("searchBar.submit")}
      </Button>
      {searchTerm && (
        <Button type="button" variant="outline" onClick={handleClear}>
          {t("searchBar.clear")}
        </Button>
      )}
    </form>
  );
}
