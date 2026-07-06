"use client";

/**
 * src/components/ui/datetime-picker.jsx
 *
 * UTC-safe DateTimePicker.
 *
 * CONTRACT
 * --------
 * • `date`    prop  – a JavaScript Date (or null).  When the value comes from
 *                     the API it must have been parsed via parseUTCDate() first
 *                     so it represents an absolute UTC instant.
 * • `setDate` prop  – called with a JavaScript Date that holds the user's
 *                     local-timezone wall-clock selection.  Callers that need
 *                     to send the value to the API must call toUTCISOString()
 *                     from src/utils/dateUtils.js before submission.
 *
 * Conversion boundary
 * -------------------
 * User-facing display (the button label and the time input) is rendered in the
 * user's local timezone via date-fns `format`, which uses the local offset.
 * We never call toISOString() / UTC methods inside this component — that would
 * silently shift the displayed time by the user's UTC offset.
 */

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export function DateTimePicker({
  date,
  setDate,
  placeholder = "Pick a date and time",
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Derive the displayed time string from the local representation of `date`.
  // format(date, "HH:mm") uses local-timezone hours/minutes — correct for a
  // time picker that the user interacts with in their own timezone.
  const [timeValue, setTimeValue] = React.useState(
    date ? format(date, "HH:mm") : "09:00"
  );

  // Keep timeValue in sync whenever the controlled `date` prop changes from
  // the outside (e.g. the parent pre-fills the field with an API value).
  React.useEffect(() => {
    if (date) {
      setTimeValue(format(date, "HH:mm"));
    }
  }, [date]);

  // -------------------------------------------------------------------------
  // handleDateSelect
  // -------------------------------------------------------------------------
  // Called by the Calendar when the user picks a day.
  // We preserve the time that was already entered in the time input.
  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    const [hours, minutes] = timeValue.split(":").map(Number);

    // Build the new Date using local-timezone setHours so the wall-clock time
    // the user sees in the input matches what gets stored in the Date object.
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(hours, minutes, 0, 0);

    setDate(newDateTime);
  };

  // -------------------------------------------------------------------------
  // handleTimeChange
  // -------------------------------------------------------------------------
  // Called when the user edits the time input.
  const handleTimeChange = (e) => {
    const time = e.target.value;
    setTimeValue(time);

    if (!date) return;

    const [hours, minutes] = time.split(":").map(Number);

    // Apply the new hours/minutes to the currently selected date, keeping the
    // date component unchanged.
    const newDateTime = new Date(date);
    newDateTime.setHours(hours, minutes, 0, 0);

    setDate(newDateTime);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            // format() renders local-timezone wall-clock time — the correct
            // representation for a date/time picker.
            format(date, "PPP HH:mm")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 opacity-50" />
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-full"
            />
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
