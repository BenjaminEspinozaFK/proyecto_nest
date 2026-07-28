import React from "react";
import { Box, Skeleton } from "@mui/material";

interface CardsSkeletonProps {
  count?: number;
  height?: number;
  minColumnWidth?: number;
}

const CardsSkeleton: React.FC<CardsSkeletonProps> = ({
  count = 4,
  height = 140,
  minColumnWidth = 220,
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, 1fr)",
        md: `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`,
      },
      gap: 3,
      mb: 4,
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={height}
        sx={{ borderRadius: "16px" }}
      />
    ))}
  </Box>
);

export default CardsSkeleton;
