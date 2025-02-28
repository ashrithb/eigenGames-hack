// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FlappyBirdBetting {
    // Game constants
    uint256 public constant ENTRY_FEE = 0.001 ether; // 0.001 KITE
    uint256 public constant GAME_DURATION = 1 days;
    uint256 public constant MAX_HISTORY = 10; // Store last 10 games
    uint256 public constant TOP_SPENDERS_COUNT = 5;

    // Structs
    struct GameHistory {
        uint256 gameId;
        address winner;
        uint256 score;
        uint256 prizePool;
        uint256 timestamp;
        uint256 totalPlayers;
    }

    struct PlayerStats {
        address playerAddress;
        uint256 totalSpent;
    }

    // Game state variables
    uint256 public gameStartTime;
    uint256 public prizePool;
    address public currentWinner;
    uint256 public highestScore;
    mapping(address => bool) public hasEntered;
    mapping(address => uint256) public playerScores;
    mapping(uint256 => address[]) public gameParticipants;
    uint256 public currentGameId;
    bool public gameInProgress;

    // Leaderboard variables
    mapping(address => uint256) public totalSpentByPlayer;
    PlayerStats[] public topSpenders;

    // History tracking
    GameHistory[] public gameHistory;

    // Skin related state variables
    mapping(address => uint256[]) public playerSkins;
    mapping(address => uint256) public currentSkin;


    // Events
    event GameStarted(uint256 gameId, uint256 startTime);
    event PlayerEntered(address player, uint256 gameId);
    event ScoreSubmitted(address player, uint256 score);
    event WinnerDetermined(address winner, uint256 score, uint256 prizeAmount);
    event GameReset(uint256 newGameId);
    event LeaderboardUpdated(address player, uint256 totalSpent);
    event SkinPurchased(address player, uint256 skinId);
    event SkinSelected(address player, uint256 skinId);

    constructor() {
        startNewGame();
    }

    // Update leaderboard
    function updateLeaderboard(address player, uint256 amount) private {
        totalSpentByPlayer[player] += amount;
        uint256 playerTotal = totalSpentByPlayer[player];
        
        // Update top spenders array
        bool found = false;
        for (uint i = 0; i < topSpenders.length; i++) {
            if (topSpenders[i].playerAddress == player) {
                topSpenders[i].totalSpent = playerTotal;
                found = true;
                break;
            }
        }
        
        if (!found) {
            if (topSpenders.length < TOP_SPENDERS_COUNT) {
                topSpenders.push(PlayerStats(player, playerTotal));
            } else if (playerTotal > topSpenders[topSpenders.length - 1].totalSpent) {
                topSpenders[topSpenders.length - 1] = PlayerStats(player, playerTotal);
            }
        }
        
        // Sort top spenders
        for (uint i = 0; i < topSpenders.length - 1; i++) {
            for (uint j = i + 1; j < topSpenders.length; j++) {
                if (topSpenders[i].totalSpent < topSpenders[j].totalSpent) {
                    PlayerStats memory temp = topSpenders[i];
                    topSpenders[i] = topSpenders[j];
                    topSpenders[j] = temp;
                }
            }
        }
        
        emit LeaderboardUpdated(player, playerTotal);
    }

    // Start a new game
    function startNewGame() private {
        currentGameId++;
        gameStartTime = block.timestamp;
        highestScore = 0;
        currentWinner = address(0);
        gameInProgress = true;
        
        emit GameStarted(currentGameId, gameStartTime);
    }

    // Enter the game by paying the entry fee
    function enterGame() external payable {
        require(msg.value == ENTRY_FEE, "Must send exactly 0.001 KITE");
        require(!hasEntered[msg.sender], "Already entered current game");
        
        // Check if previous game ended and start a new one if needed
        if (block.timestamp >= gameStartTime + GAME_DURATION) {
            endGame();
            startNewGame();
        }
        
        // Record player entry
        hasEntered[msg.sender] = true;
        prizePool += msg.value;
        gameParticipants[currentGameId].push(msg.sender);
        
        // Update leaderboard
        updateLeaderboard(msg.sender, msg.value);
        
        emit PlayerEntered(msg.sender, currentGameId);
    }

    // Submit a score
    function submitScore(uint256 score) external {
        require(hasEntered[msg.sender], "Must enter the game first");
        require(gameInProgress, "Game not in progress");
        require(block.timestamp < gameStartTime + GAME_DURATION, "Game has ended");
        
        // Update player's score if it's higher than their previous score
        if (score > playerScores[msg.sender]) {
            playerScores[msg.sender] = score;
            
            // Update highest score if needed
            if (score > highestScore) {
                highestScore = score;
                currentWinner = msg.sender;
                
                emit ScoreSubmitted(msg.sender, score);
            }
        }
    }

    // End the current game and distribute prize
    function endGame() public {
        require(block.timestamp >= gameStartTime + GAME_DURATION, "Game duration not yet passed");
        require(gameInProgress, "Game not in progress");
        
        gameInProgress = false;
        
        // Record game history
        if (gameHistory.length >= MAX_HISTORY) {
            // Remove oldest entry if we've reached max history
            for (uint i = 0; i < gameHistory.length - 1; i++) {
                gameHistory[i] = gameHistory[i + 1];
            }
            gameHistory.pop();
        }
        
        // Add new history entry
        gameHistory.push(GameHistory({
            gameId: currentGameId,
            winner: currentWinner,
            score: highestScore,
            prizePool: prizePool,
            timestamp: block.timestamp,
            totalPlayers: gameParticipants[currentGameId].length
        }));
        
        // If there's a winner and prize pool, distribute the prize
        if (currentWinner != address(0) && prizePool > 0) {
            uint256 prize = prizePool;
            prizePool = 0;
            
            emit WinnerDetermined(currentWinner, highestScore, prize);
            
            // Reset player entries for the next game
            for (uint i = 0; i < gameParticipants[currentGameId].length; i++) {
                hasEntered[gameParticipants[currentGameId][i]] = false;
                playerScores[gameParticipants[currentGameId][i]] = 0;
            }
            
            // Transfer prize to winner
            (bool success, ) = payable(currentWinner).call{value: prize}("");
            require(success, "Prize transfer failed");
        }
        
        emit GameReset(currentGameId + 1);
    }

    // Check if game needs to be reset and do so if needed
    function checkAndResetGame() external {
        if (block.timestamp >= gameStartTime + GAME_DURATION && gameInProgress) {
            endGame();
            startNewGame();
        }
    }

    // View functions
    function getGameInfo() external view returns (
        uint256 _gameId,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _prizePool,
        address _currentWinner,
        uint256 _highestScore,
        bool _gameInProgress
    ) {
        return (
            currentGameId,
            gameStartTime,
            gameStartTime + GAME_DURATION,
            prizePool,
            currentWinner,
            highestScore,
            gameInProgress
        );
    }

    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= gameStartTime + GAME_DURATION) {
            return 0;
        }
        return gameStartTime + GAME_DURATION - block.timestamp;
    }

    function getPlayerScore(address player) external view returns (uint256) {
        return playerScores[player];
    }

    function hasPlayerEntered(address player) external view returns (bool) {
        return hasEntered[player];
    }

    // New view functions for leaderboard and history
    function getTopSpenders() external view returns (PlayerStats[] memory) {
        return topSpenders;
    }

    function getGameHistory() external view returns (GameHistory[] memory) {
        return gameHistory;
    }

    function getPlayerTotalSpent(address player) external view returns (uint256) {
        return totalSpentByPlayer[player];
    }

    function purchaseSkin(uint256 skinId) external payable {
        require(skinId > 0, "Invalid skin ID"); // 0 is default skin
        require(msg.value == 0.01 ether, "Must send exactly 0.01 KITE");
        require(!hasSkin(msg.sender, skinId), "Already owns this skin");
    
        playerSkins[msg.sender].push(skinId);
        emit SkinPurchased(msg.sender, skinId);
    }

    function selectSkin(uint256 skinId) external {
        require(skinId == 0 || hasSkin(msg.sender, skinId), "Must own skin to select it");
        currentSkin[msg.sender] = skinId;
        emit SkinSelected(msg.sender, skinId);
    }

    function hasSkin(address player, uint256 skinId) public view returns (bool) {
        for (uint i = 0; i < playerSkins[player].length; i++) {
            if (playerSkins[player][i] == skinId) return true;
        }
        return false;
    }

    function getPlayerSkins(address player) external view returns (uint256[] memory) {
        return playerSkins[player];
    }

    function getCurrentSkin(address player) external view returns (uint256) {
        return currentSkin[player];
    }
}

