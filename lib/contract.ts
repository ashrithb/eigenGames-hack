// Contract address on KiteAI Testnet
export const contractAddress = "0x85677C75fc241e3F7ee908e743B56AFc1657111A"

// Contract ABI
export const contractABI = [
  // Game info functions
  "function getGameInfo() view returns (uint256, uint256, uint256, uint256, address, uint256, bool)",
  "function getTimeRemaining() view returns (uint256)",
  "function getPlayerScore(address) view returns (uint256)",
  "function hasPlayerEntered(address) view returns (bool)",
  "function getTopSpenders() view returns (tuple(address playerAddress, uint256 totalSpent)[])",
  "function getGameHistory() view returns (tuple(uint256 gameId, address winner, uint256 score, uint256 prizePool, uint256 timestamp, uint256 totalPlayers)[])",
  "function getPlayerTotalSpent(address) view returns (uint256)",
  "function getPlayerSkins(address) view returns (uint256[])",
  "function getCurrentSkin(address) view returns (uint256)",

  // Game interaction functions
  "function enterGame() payable",
  "function submitScore(uint256)",
  "function checkAndResetGame()",
  "function purchaseSkin(uint256) payable",
  "function selectSkin(uint256)",

  // Events
  "event GameStarted(uint256 gameId, uint256 startTime)",
  "event PlayerEntered(address player, uint256 gameId)",
  "event ScoreSubmitted(address player, uint256 score)",
  "event WinnerDetermined(address winner, uint256 score, uint256 prizeAmount)",
  "event GameReset(uint256 newGameId)",
  "event SkinPurchased(address player, uint256 skinId)",
  "event SkinSelected(address player, uint256 skinId)",
]

// Skin data
export const skins = [
  {
    id: 0,
    name: "Default Bird",
    description: "The classic yellow bird",
    price: "0",
    colors: {
      body: "#FFD700",
      wing: "#E6C700",
      beak: "#FF6600",
    },
    background: "#F0F4F8",
  },
  {
    id: 1,
    name: "Red Bird",
    description: "A fiery red bird",
    price: "0.01",
    colors: {
      body: "#FF4136",
      wing: "#DC352F",
      beak: "#FF851B",
    },
    background: "#FFECEC",
  },
  {
    id: 2,
    name: "Blue Bird",
    description: "A cool blue bird",
    price: "0.01",
    colors: {
      body: "#0074D9",
      wing: "#005DC2",
      beak: "#7FDBFF",
    },
    background: "#EDF5FF",
  },
]

