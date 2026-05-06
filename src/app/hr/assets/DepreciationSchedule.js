"use client"

import { format } from 'date-fns'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table'

const DepreciationSchedule = ({ schedule }) => {
  if (!schedule || schedule.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <Table className="border">
        <TableCaption>{`Depreciation schedule (${schedule.length} periods)`}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Depreciation</TableHead>
            <TableHead>Total Depreciation</TableHead>
            <TableHead>Book Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((row) => (
            <TableRow key={row.period}>
              <TableCell>{row.period}</TableCell>
              <TableCell>{format(new Date(row.date), 'yyyy-MM-dd')}</TableCell>
              <TableCell>{row.depreciation.toFixed(2)}</TableCell>
              <TableCell>{row.totalDepreciation.toFixed(2)}</TableCell>
              <TableCell>{row.bookValue.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DepreciationSchedule
