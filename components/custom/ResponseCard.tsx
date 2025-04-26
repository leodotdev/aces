import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Pressable } from "@/components/ui/pressable";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { View } from "react-native";
import { PieChart, BarChart, LineChart } from "react-native-svg-charts";

interface ResponseCardProps {
  data: any;
}

/**
 * A card component that displays JSON data returned from Claude with data visualization
 */
export function ResponseCard({ data }: ResponseCardProps) {
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);
  const [isCitationExpanded, setIsCitationExpanded] = useState(false);

  if (!data) return null;

  // Extract citation for special rendering, if present
  const hasCitation = data.citation !== undefined;

  // Determine if data can be visualized (contains arrays or numeric data)
  const chartData = useMemo(() => {
    // Try to extract visualizable data from the response
    try {
      // If the data has properties like "data", "values", "numbers", etc.
      const potentialDataSources = [
        "data",
        "values",
        "numbers",
        "statistics",
        "results",
      ];

      // First check for direct array properties
      for (const source of potentialDataSources) {
        if (data[source] && Array.isArray(data[source])) {
          // Check if array has enough numeric data to visualize
          if (data[source].length > 0) {
            return {
              source,
              data: data[source],
              type: detectChartType(data[source]),
              labels: data.categories || data.labels || data.months || null,
            };
          }
        }
      }

      // If no obvious data arrays, try to find arrays with numeric values
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.length > 0) {
          // Check if it's an array of numbers or objects with numeric values
          if (
            value.every(
              (item) =>
                typeof item === "number" ||
                (typeof item === "object" &&
                  item !== null &&
                  (typeof item.value === "number" ||
                    typeof item.y === "number"))
            )
          ) {
            return {
              source: key,
              data: value,
              type: detectChartType(value),
              labels: data.categories || data.labels || data.months || null,
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error extracting chart data:", error);
      return null;
    }
  }, [data]);

  // Function to render the appropriate chart based on data
  const renderChart = () => {
    if (!chartData) return null;

    const { data: chartValues, type, labels } = chartData;

    // Prepare data for charts
    switch (type) {
      case "pie":
        // Transform data for pie chart
        const pieData = chartValues.map((item, index) => {
          // Handle both number values and object values
          const value =
            typeof item === "number" ? item : (item.value ?? item.y ?? 1);
          // Use label from item or from labels array if available
          const label =
            typeof item === "object" && item?.name
              ? item.name
              : labels && labels[index]
                ? labels[index]
                : `Item ${index + 1}`;

          return {
            value,
            key: index,
            svg: { fill: getRandomColor(index) },
            arc: { outerRadius: "100%", padAngle: 0.02 },
            // Add the label for potential future labeling
            label,
          };
        });

        return (
          <View style={{ height: 250, marginVertical: 8 }}>
            <PieChart
              style={{ height: 250 }}
              data={pieData}
              innerRadius="0%"
              outerRadius="100%"
              padAngle={0}
            />
          </View>
        );

      case "bar":
        // Transform data for bar chart
        const barData = chartValues.map((item) =>
          typeof item === "number" ? item : (item.value ?? item.y ?? 1)
        );

        return (
          <View style={{ height: 250, marginVertical: 8 }}>
            <BarChart
              style={{ height: 250 }}
              data={barData}
              svg={{ fill: "#6563ff" }}
              contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
              spacing={0.2}
            />
          </View>
        );

      case "line":
        // Check if data has x,y coordinates
        const hasXYCoordinates =
          chartValues.length > 0 &&
          typeof chartValues[0] === "object" &&
          chartValues[0] !== null &&
          "x" in chartValues[0] &&
          "y" in chartValues[0];

        // Transform data for line chart
        let lineData;

        if (hasXYCoordinates) {
          // Data already has x,y format, use y values directly
          lineData = chartValues.map((item) => item.y);
        } else {
          // Convert to simple array of values
          lineData = chartValues.map((item) =>
            typeof item === "number" ? item : (item.y ?? item.value ?? 1)
          );
        }

        return (
          <View style={{ height: 250, marginVertical: 8 }}>
            <LineChart
              style={{ height: 250 }}
              data={lineData}
              svg={{ stroke: "#6563ff", strokeWidth: 2 }}
              contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
            />
          </View>
        );

      default:
        return null;
    }
  };

  // Function to get random colors for chart elements
  const getRandomColor = (index: number) => {
    const colors = [
      "#6563ff",
      "#ff6584",
      "#4791db",
      "#81c784",
      "#ffb74d",
      "#e57373",
      "#64b5f6",
      "#ba68c8",
    ];
    return colors[index % colors.length];
  };

  // Function to detect what type of chart would best represent the data
  function detectChartType(data: any[]): string | null {
    if (!Array.isArray(data) || data.length === 0) return null;

    // Check for time series data (objects with x,y coordinates)
    if (
      data.length > 0 &&
      typeof data[0] === "object" &&
      data[0] !== null &&
      "x" in data[0] &&
      "y" in data[0]
    ) {
      return "line"; // Time series data is best shown as a line chart
    }

    // If array of objects with category/value pairs, a pie or bar chart might be good
    if (data.every((item) => typeof item === "object" && item !== null)) {
      // Check for name/value pairs which are good for pie charts
      if (data.some((item) => item.name || item.category || item.label)) {
        // If we have 7 or fewer categories, a pie chart makes sense
        return data.length <= 7 ? "pie" : "bar";
      }
    }

    // If simple array of numbers
    if (data.every((item) => typeof item === "number")) {
      // With few data points, pie charts are readable
      if (data.length <= 7) {
        return "pie";
      }
      // With more data points, use bar chart
      else if (data.length <= 20) {
        return "bar";
      }
      // With many data points, use line chart
      else {
        return "line";
      }
    }

    // Handle mixed data types or arrays with lots of objects
    if (data.length > 10) {
      return "line"; // Line charts can handle more data points
    }

    // Default to bar for other scenarios
    return "bar";
  }

  // Function to render nested JSON data recursively
  const renderData = (data: any, level = 0, excludeKeys: string[] = []) => {
    if (typeof data === "object" && data !== null) {
      return (
        <VStack space="xs" className="ml-4">
          {Object.entries(data)
            .filter(([key]) => !excludeKeys.includes(key))
            .map(([key, value], index) => (
              <Box key={`${key}-${index}`}>
                <Text className="font-semibold">{key}:</Text>
                {renderData(value, level + 1)}
              </Box>
            ))}
        </VStack>
      );
    } else if (Array.isArray(data)) {
      return (
        <VStack space="xs" className="ml-4">
          {data.map((item, index) => (
            <Box key={index}>
              <Text className="font-semibold">{index}:</Text>
              {renderData(item, level + 1)}
            </Box>
          ))}
        </VStack>
      );
    } else {
      // Render primitive values directly
      return <Text className="ml-4">{String(data)}</Text>;
    }
  };

  // Function to render citation in a formatted way
  const renderCitation = (citation: any) => {
    if (typeof citation === "string") {
      return <Text className="text-gray-600 italic">{citation}</Text>;
    } else if (typeof citation === "object" && citation !== null) {
      return (
        <VStack space="xs" className="ml-4">
          {Object.entries(citation).map(([key, value], index) => (
            <Box key={`${key}-${index}`}>
              <Text className="font-semibold text-gray-600">{key}:</Text>
              <Text className="ml-4 text-gray-600">{String(value)}</Text>
            </Box>
          ))}
        </VStack>
      );
    }
    return null;
  };

  // Section to display if no chart can be rendered
  const renderNoChartMessage = () => {
    return (
      <Box className="py-4 items-center">
        <Text className="text-gray-500">
          No data available for visualization
        </Text>
      </Box>
    );
  };

  return (
    <Card variant="outline" className="w-full mb-4 p-4">
      <VStack space="md">
        {/* Title Section */}
        {data.title && <Heading size="sm">{data.title}</Heading>}

        {/* Section 1: Data Visualization (Always visible) */}
        <Box className="border-b border-gray-200 pb-3">
          <Text className="font-semibold mb-2">Visualization</Text>
          {chartData ? renderChart() : renderNoChartMessage()}
        </Box>

        {/* Section 2: Collapsible JSON Data */}
        <Box className="border-b border-gray-200 pb-3">
          <Pressable onPress={() => setIsJsonExpanded(!isJsonExpanded)}>
            <Box className="flex-row items-center">
              {isJsonExpanded ? (
                <ChevronDown size={20} color="#666" />
              ) : (
                <ChevronRight size={20} color="#666" />
              )}
              <Text className="ml-2 font-semibold">
                {isJsonExpanded ? "Hide JSON data" : "Show JSON data"}
              </Text>
            </Box>
          </Pressable>

          {isJsonExpanded && (
            <Box className="mt-2 p-3 bg-gray-50 rounded-md">
              {renderData(data, 0, ["citation"])}
            </Box>
          )}
        </Box>

        {/* Section 3: Collapsible Citations */}
        {hasCitation && (
          <Box>
            <Pressable
              onPress={() => setIsCitationExpanded(!isCitationExpanded)}
            >
              <Box className="flex-row items-center">
                {isCitationExpanded ? (
                  <ChevronDown size={20} color="#666" />
                ) : (
                  <ChevronRight size={20} color="#666" />
                )}
                <Text className="ml-2 font-semibold">
                  {isCitationExpanded ? "Hide sources" : "Show sources"}
                </Text>
              </Box>
            </Pressable>

            {isCitationExpanded && (
              <Box className="mt-2 p-3 bg-gray-50 rounded-md">
                {renderCitation(data.citation)}
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Card>
  );
}
