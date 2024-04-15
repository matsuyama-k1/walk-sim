import { formatDate } from "@/lib/utils";
import {
  Button,
  Divider,
  List,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import { memo, useMemo } from "react";
import { GameResult } from "../hooks/useScoreRelay_";

type RankingProps = {
  results: GameResult[];
  onStartNewGame: (gameSeedId?: string) => void;
};

const ScoreRelay = memo(({ results, onStartNewGame }: RankingProps) => {
  const sortedRecords = useMemo(() => {
    return results.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [results]);

  return (
    <VStack spacing={4} align="stretch">
      <Button
        mb={4}
        colorScheme="teal"
        size="lg"
        onClick={() => onStartNewGame()}
      >
        新しいゲームを始める
      </Button>
      <Text fontWeight="bold" pb={2}>
        途中から始める:
      </Text>
      <List spacing={3}>
        {sortedRecords.map((result, index) => (
          <ListItem key={index} boxShadow="md" borderRadius="md">
            <Button
              onClick={() => onStartNewGame(result.gameSeedId)}
              width="full"
              justifyContent="space-between"
              variant="ghost"
              p={4}
            >
              <Text fontWeight="medium">{`${index + 1}. ${
                result.score
              } points`}</Text>
              <Text isTruncated maxW="200px" fontWeight="medium">
                {result.name}
              </Text>
              <Text size="sm">
                {formatDate(new Date(result.latestTimestamp))}
              </Text>
            </Button>
            {index < sortedRecords.length - 1 && <Divider />}
          </ListItem>
        ))}
      </List>
    </VStack>
  );
});

ScoreRelay.displayName = "Ranking";

export default ScoreRelay;
