import React from "react";
import { Skeleton } from "@mui/material";

interface ChartSkeletonProps {
  height?: number;
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ height = 320 }) => (
  <Skeleton variant="rounded" height={height} sx={{ borderRadius: "20px" }} />
);

export default ChartSkeleton;
