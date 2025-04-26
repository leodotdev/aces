declare module 'react-native-svg-charts' {
  import { ComponentType, ReactNode } from 'react';
  import { ViewProps } from 'react-native';

  interface ChartProps extends ViewProps {
    data: any[];
    svg?: any;
    contentInset?: {
      top?: number;
      left?: number;
      right?: number;
      bottom?: number;
    };
    [key: string]: any;
  }

  export const PieChart: ComponentType<ChartProps>;
  export const BarChart: ComponentType<ChartProps>;
  export const LineChart: ComponentType<ChartProps>;
  export const AreaChart: ComponentType<ChartProps>;
  export const StackedAreaChart: ComponentType<ChartProps>;
  export const StackedBarChart: ComponentType<ChartProps>;
  export const Grid: ComponentType<any>;
  export const XAxis: ComponentType<any>;
  export const YAxis: ComponentType<any>;
} 