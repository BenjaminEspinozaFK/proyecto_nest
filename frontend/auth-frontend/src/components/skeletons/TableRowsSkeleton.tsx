import React from "react";
import { TableRow, TableCell, Skeleton } from "@mui/material";

interface TableRowsSkeletonProps {
  rows?: number;
  columns: number;
}

const TableRowsSkeleton: React.FC<TableRowsSkeletonProps> = ({
  rows = 5,
  columns,
}) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={rowIndex}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <TableCell key={colIndex}>
            <Skeleton variant="text" height={24} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export default TableRowsSkeleton;
