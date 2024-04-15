import { formatDate } from "@/lib/utils";
import { Box, Button, Flex, List, ListItem, Text } from "@chakra-ui/react";
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
    <Box>
      <Button mb={4} colorScheme="orange" onClick={() => onStartNewGame()}>
        新しいゲームを始める
      </Button>
      <List spacing={3}>
        {sortedRecords.map((result, index) => (
          <ListItem key={index} p={2}>
            <Flex
              width="full"
              justifyContent="space-between"
              px="10px"
              fontWeight="bold"
              gap="5px"
            >
              <Text>{`${index + 1}. ${result.score} points`}</Text>
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
    </Box>
  );
});

RankingBattle.displayName = "RankingBattle";

export default RankingBattle;
