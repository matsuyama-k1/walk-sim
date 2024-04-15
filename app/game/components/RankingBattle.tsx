import { formatDate } from "@/lib/utils";
import { Button, Flex, List, ListItem, Text, VStack } from "@chakra-ui/react";
import { memo, useMemo } from "react";
import { GameResult } from "../hooks/useScoreRelay_";

type RankingProps = {
  results: GameResult[];
  onStartNewGame: () => void;
};

const RankingBattle = memo(({ results, onStartNewGame }: RankingProps) => {
  const sortedRecords = useMemo(() => {
    return results.sort((a, b) => b.score - a.score);
  }, [results]);

  return (
    <VStack spacing={4} align="stretch">
      <Button
        mb={4}
        colorScheme="orange"
        size="lg"
        onClick={() => onStartNewGame()}
      >
        ランキングバトルを始める
      </Button>
      <List spacing={3} h="300px" overflow="scroll">
        {sortedRecords.map((result, index) => (
          <ListItem key={index} p={2}>
            <Flex
              width="full"
              justifyContent="space-between"
              px="10px"
              fontWeight="bold"
              gap="5px"
            >
              <Text>{`${index + 1}. `}</Text>
              <Text>{`${result.score} points`}</Text>
              <Text isTruncated maxW="200px">
                {result.name}
              </Text>
              <Text size="sm">
                {formatDate(new Date(result.latestTimestamp))}
              </Text>
            </Flex>
          </ListItem>
        ))}
      </List>
    </VStack>
  );
});

RankingBattle.displayName = "RankingBattle";

export default RankingBattle;
