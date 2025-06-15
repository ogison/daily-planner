"use client";

import { useEffect, useState } from "react";
import { ScheduleItem, CATEGORY_LABELS, CATEGORY_COLORS, ScheduleCategory } from "@/types/schedule";

interface TimeSegment {
  id: string;
  label: string;
  startMinute: number;
  endMinute: number;
  color: string;
  category?: ScheduleCategory;
}

interface CircularTimeGraphProps {
  scheduleItems?: ScheduleItem[];
  viewMode?: "schedule" | "category";
}

const convertScheduleItemsToSegments = (
  scheduleItems: ScheduleItem[]
): TimeSegment[] => {
  return scheduleItems.map((item) => ({
    id: item.id,
    label: CATEGORY_LABELS[item.category] || item.title,
    startMinute: item.startTime,
    endMinute: item.endTime,
    color: item.color || CATEGORY_COLORS[item.category] || "#64748b",
    category: item.category,
  }));
};

const convertScheduleItemsToCategorySegments = (
  scheduleItems: ScheduleItem[]
): TimeSegment[] => {
  // Group items by category and calculate total time for each
  const categoryData = scheduleItems.reduce((acc, item) => {
    const duration = item.endTime - item.startTime;
    if (!acc[item.category]) {
      acc[item.category] = {
        totalMinutes: 0,
        items: [],
      };
    }
    acc[item.category].totalMinutes += duration;
    acc[item.category].items.push(item);
    return acc;
  }, {} as Record<ScheduleCategory, { totalMinutes: number; items: ScheduleItem[] }>);

  // Convert to segments for circular display
  let currentAngle = 0;
  return Object.entries(categoryData).map(([category, data]) => {
    const segment: TimeSegment = {
      id: `category-${category}`,
      label: `${CATEGORY_LABELS[category as ScheduleCategory]}`,
      startMinute: (currentAngle / 360) * 1440,
      endMinute: ((currentAngle + (data.totalMinutes / 1440) * 360) / 360) * 1440,
      color: CATEGORY_COLORS[category as ScheduleCategory],
      category: category as ScheduleCategory,
    };
    currentAngle += (data.totalMinutes / 1440) * 360;
    return segment;
  });
};

export default function CircularTimeGraph({
  scheduleItems = [],
  viewMode = "schedule",
}: CircularTimeGraphProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const segments = viewMode === "category" 
    ? convertScheduleItemsToCategorySegments(scheduleItems)
    : convertScheduleItemsToSegments(scheduleItems);
  const size = 400;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = 180;
  const innerRadius = 0;

  if (!isClient) {
    return (
      <div className="flex justify-center">
        <div
          style={{ width: size + 100, height: size + 100 }}
          className="flex items-center justify-center"
        >
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  const createArcPath = (startAngle: number, endAngle: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  const getTextPosition = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const textRadius = (outerRadius + innerRadius) / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;

    return {
      x: centerX + textRadius * Math.cos(midAngleRad),
      y: centerY + textRadius * Math.sin(midAngleRad),
    };
  };

  const getHourLabelPosition = (hour: number) => {
    const angle = ((hour * 15 - 90) * Math.PI) / 180;
    const labelRadius = outerRadius + 30;

    return {
      x: centerX + labelRadius * Math.cos(angle),
      y: centerY + labelRadius * Math.sin(angle),
    };
  };

  return (
    <div className="flex justify-center">
      <svg width={size + 100} height={size + 100} className="overflow-visible">
        {segments.map((segment) => {
          const startAngle = (segment.startMinute / 1440) * 360 - 90;
          const endAngle = (segment.endMinute / 1440) * 360 - 90;
          const arcPath = createArcPath(startAngle, endAngle);
          const textPos = getTextPosition(startAngle, endAngle);
          const duration = segment.endMinute - segment.startMinute;
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;

          return (
            <g key={segment.id}>
              <path
                d={arcPath}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
              >
                {segment.label}
              </text>
              {viewMode === "category" && (
                <text
                  x={textPos.x}
                  y={textPos.y + 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14"
                >
                  {hours > 0 ? `${hours}時間${minutes > 0 ? `${minutes}分` : ''}` : `${minutes}分`}
                </text>
              )}
            </g>
          );
        })}

        {viewMode === "schedule" && Array.from({ length: 24 }, (_, i) => {
          const hour = i;
          const labelPos = getHourLabelPosition(hour);

          return (
            <text
              key={hour}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="600"
              fill="#374151"
            >
              {hour}時
            </text>
          );
        })}
      </svg>
    </div>
  );
}
