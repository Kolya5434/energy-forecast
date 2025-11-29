import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import {
  BarChart,
  LineChart,
  ScatterChart
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Register only the required components
echarts.use([
  BarChart,
  LineChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer
]);

interface OptimizedEChartProps {
  option: echarts.EChartsCoreOption;
  style?: React.CSSProperties;
  theme?: string;
  notMerge?: boolean;
  lazyUpdate?: boolean;
}

export const OptimizedEChart = ({
  option,
  style = { height: 400 },
  theme,
  notMerge = false,
  lazyUpdate = false
}: OptimizedEChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart if not exists
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current, theme);
    }

    // Set option
    chartInstanceRef.current.setOption(option, notMerge, lazyUpdate);

    // Handle resize
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [option, theme, notMerge, lazyUpdate]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.dispose();
    };
  }, []);

  return <div ref={chartRef} style={style} />;
};
