export interface GameOption {
  id: string;
  label: string;
  isSafe: boolean;
  color: string;
}

export interface RoundResult {
  roundNumber: number;
  selectedOption: GameOption;
  eliminated: boolean;
}
