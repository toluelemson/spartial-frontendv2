import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface DataItem {
    feature: string;
    value: number;
}

interface LollipopChartProps {
    data: DataItem[];
}

const LollipopChart: React.FC<LollipopChartProps> = ({ data }) => {
    const d3Container = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (data && d3Container.current) {
            const margin = { top: 20, right: 30, bottom: 40, left: 90 };
            const width = 460 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            // Clear SVG content
            d3.select(d3Container.current).selectAll("*").remove();

            const svg = d3.select(d3Container.current)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Add X axis
            const x = d3.scaleLinear()
                .domain([0, d3.max(data, (d: DataItem) => d.value) as number])
                .range([0, width]);
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            // Y axis
            const y = d3.scaleBand()
                .range([0, height])
                .domain(data.map((d: DataItem) => d.feature))
                .padding(1);
            svg.append("g")
                .call(d3.axisLeft(y));

            // Lines
            svg.selectAll("myline")
                .data(data)
                .join("line")
                .attr("x1", (d: DataItem) => x(d.value))
                .attr("x2", x(0))
                .attr("y1", (d: DataItem) => y(d.feature) as number)
                .attr("y2", (d: DataItem) => y(d.feature) as number)
                .attr("stroke", "grey");

            // Circles
            svg.selectAll("mycircle")
                .data(data)
                .join("circle")
                .attr("cx", (d: DataItem) => x(d.value))
                .attr("cy", (d: DataItem) => y(d.feature) as number)
                .attr("r", "4")
                .attr("fill", "#69b3a2");
        }
    }, [data]);

    return (
        <div>
            <svg ref={d3Container} />
        </div>
    );
};

export default LollipopChart;
