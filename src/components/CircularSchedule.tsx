'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { ScheduleItem, formatTime } from '@/types/schedule';

interface CircularScheduleProps {
  items: ScheduleItem[];
  onItemClick?: (item: ScheduleItem) => void;
}

const CircularSchedule: React.FC<CircularScheduleProps> = ({
  items,
  onItemClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredItem, setHoveredItem] = useState<ScheduleItem | null>(null);

  const dimensions = {
    width: 400,
    height: 400,
    margin: 40,
  };

  const radius = (dimensions.width - dimensions.margin * 2) / 2;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const angleScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, 1440]) // 24 hours in minutes
      .range([0, 2 * Math.PI]);
  }, []);

  const arc = useMemo(() => {
    return d3.arc<ScheduleItem>()
      .innerRadius(radius * 0.3)
      .outerRadius(radius * 0.9)
      .startAngle((d) => angleScale(d.startTime) - Math.PI / 2) // Start from top (12 o'clock)
      .endAngle((d) => angleScale(d.endTime) - Math.PI / 2);
  }, [angleScale, radius]);

  const hourMarks = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      angle: angleScale(i * 60) - Math.PI / 2,
      x: centerX + Math.cos(angleScale(i * 60) - Math.PI / 2) * radius * 1.1,
      y: centerY + Math.sin(angleScale(i * 60) - Math.PI / 2) * radius * 1.1,
    }));
  }, [angleScale, centerX, centerY, radius]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Draw outer circle
    g.append('circle')
      .attr('r', radius * 0.9)
      .attr('fill', 'none')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2);

    // Draw inner circle
    g.append('circle')
      .attr('r', radius * 0.3)
      .attr('fill', 'none')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    // Draw hour marks
    hourMarks.forEach(({ hour, angle }) => {
      const innerRadius = radius * 0.85;
      const outerRadius = radius * 0.9;
      
      g.append('line')
        .attr('x1', Math.cos(angle) * innerRadius)
        .attr('y1', Math.sin(angle) * innerRadius)
        .attr('x2', Math.cos(angle) * outerRadius)
        .attr('y2', Math.sin(angle) * outerRadius)
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', hour % 6 === 0 ? 2 : 1);
    });

    // Draw hour labels
    g.selectAll('.hour-label')
      .data(hourMarks.filter((_, i) => i % 3 === 0))
      .enter()
      .append('text')
      .attr('class', 'hour-label')
      .attr('x', (d) => Math.cos(d.angle) * radius * 1.15)
      .attr('y', (d) => Math.sin(d.angle) * radius * 1.15)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text((d) => d.hour.toString().padStart(2, '0'));

    // Draw schedule items
    const scheduleArcs = g.selectAll('.schedule-arc')
      .data(items)
      .enter()
      .append('g')
      .attr('class', 'schedule-arc');

    scheduleArcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.color || '#6b7280')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', function(_, d) {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke-width', 3);
        setHoveredItem(d);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', 2);
        setHoveredItem(null);
      })
      .on('click', function(_, d) {
        if (onItemClick) {
          onItemClick(d);
        }
      });

    // Add labels for larger items
    scheduleArcs
      .filter((d) => d.endTime - d.startTime >= 60) // Only show labels for items >= 1 hour
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .attr('pointer-events', 'none')
      .attr('transform', (d) => {
        const midAngle = (angleScale(d.startTime) + angleScale(d.endTime)) / 2 - Math.PI / 2;
        const textRadius = radius * 0.6;
        const x = Math.cos(midAngle) * textRadius;
        const y = Math.sin(midAngle) * textRadius;
        return `translate(${x}, ${y})`;
      })
      .text((d) => d.title.length > 8 ? d.title.substring(0, 6) + '...' : d.title);

  }, [items, arc, hourMarks, centerX, centerY, radius, angleScale, onItemClick]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="drop-shadow-sm"
      />
      
      {/* Tooltip */}
      {hoveredItem && (
        <div className="absolute top-2 left-2 bg-white rounded-lg shadow-lg p-3 border max-w-xs z-10">
          <div className="font-semibold text-gray-900">{hoveredItem.title}</div>
          <div className="text-sm text-gray-600">
            {formatTime(hoveredItem.startTime)} - {formatTime(hoveredItem.endTime)}
          </div>
          {hoveredItem.notes && (
            <div className="text-sm text-gray-500 mt-1">{hoveredItem.notes}</div>
          )}
        </div>
      )}

      {/* Center time display */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-full shadow-md p-4 border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {new Date().toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
            <div className="text-sm text-gray-500">現在時刻</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularSchedule;