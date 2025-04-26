import React from "react";
import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Box } from "@/components/ui/box";

interface ResponseCardProps {
  data: any;
}

/**
 * A card component that displays JSON data returned from Claude
 */
export function ResponseCard({ data }: ResponseCardProps) {
  if (!data) return null;

  // Function to render nested JSON data recursively
  const renderData = (data: any, level = 0) => {
    if (typeof data === "object" && data !== null) {
      return (
        <VStack space="xs" className="ml-4">
          {Object.entries(data).map(([key, value], index) => (
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

  return (
    <Card className="w-full mb-4 p-4">
      <VStack space="md">
        {data.title && <Heading size="sm">{data.title}</Heading>}
        {renderData(data)}
      </VStack>
    </Card>
  );
}
