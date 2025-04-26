import React from "react";
import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";

interface ResponseCardProps {
  data: any;
}

/**
 * A card component that displays JSON data returned from Claude
 */
export function ResponseCard({ data }: ResponseCardProps) {
  if (!data) return null;

  // Extract citation for special rendering, if present
  const hasCitation = data.citation !== undefined;

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

  return (
    <Card className="w-full mb-4 p-4">
      <VStack space="md">
        {data.title && <Heading size="sm">{data.title}</Heading>}
        {/* Render main content, excluding citation */}
        {renderData(data, 0, ["citation"])}

        {/* Render citation if available */}
        {hasCitation && (
          <>
            <Divider className="my-2" />
            <Box className="mt-2">
              <Text className="font-semibold text-gray-600">Source:</Text>
              {renderCitation(data.citation)}
            </Box>
          </>
        )}
      </VStack>
    </Card>
  );
}
