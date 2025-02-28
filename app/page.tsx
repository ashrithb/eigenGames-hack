"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import Game from "@/components/game"
import Leaderboard from "@/components/leaderboard"
import { contractABI, contractAddress } from "@/lib/contract"
import { Wallet, Trophy, Clock, Coins } from "lucide-react"
import SkinShop from "@/components/skin-shop"
import FeaturedPreview from "@/components/featured-preview"

export default function Home() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [gameInfo, setGameInfo] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [hasEntered, setHasEntered] = useState<boolean>(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [selectedSkin, setSelectedSkin] = useState<number>(0)

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        // Check if we're on the correct network (KiteAI Testnet)
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        if (chainId !== "0x940") {
          // 0x940 is 2368 in hex
          setIsCorrectNetwork(false)
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x940" }], // KiteAI Testnet Chain ID
            })
            setIsCorrectNetwork(true)
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x940",
                      chainName: "KiteAI Testnet",
                      nativeCurrency: {
                        name: "KITE",
                        symbol: "KITE",
                        decimals: 18,
                      },
                      rpcUrls: ["https://rpc-testnet.gokite.ai/"],
                      blockExplorerUrls: ["https://testnet.kitescan.ai/"],
                    },
                  ],
                })
                setIsCorrectNetwork(true)
              } catch (addError) {
                console.error("Failed to add network:", addError)
              }
            }
          }
        } else {
          setIsCorrectNetwork(true)
        }

        const account = accounts[0]
        setAccount(account)

        // Create ethers provider and contract instance
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)

        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, contractABI, signer)
        setContract(contract)

        // Check if player has already entered the current game
        const hasEntered = await contract.hasPlayerEntered(account)
        setHasEntered(hasEntered)

        // Get game info
        await refreshGameInfo(contract)
      } catch (error) {
        console.error("Error connecting to MetaMask:", error)
      }
    } else {
      alert("Please install MetaMask to play this game!")
    }
  }

  // Refresh game info from the contract
  const refreshGameInfo = async (contractInstance: ethers.Contract) => {
    try {
      const gameInfo = await contractInstance.getGameInfo()
      setGameInfo({
        gameId: gameInfo[0],
        startTime: gameInfo[1],
        endTime: gameInfo[2],
        prizePool: ethers.formatEther(gameInfo[3]),
        currentWinner: gameInfo[4],
        highestScore: Number(gameInfo[5]),
        gameInProgress: gameInfo[6],
      })

      const timeRemaining = await contractInstance.getTimeRemaining()
      setTimeRemaining(Number(timeRemaining))
      setHighScore(Number(gameInfo[5]))

      if (account) {
        const hasEntered = await contractInstance.hasPlayerEntered(account)
        setHasEntered(hasEntered)
      }
    } catch (error) {
      console.error("Error fetching game info:", error)
    }
  }

  // Enter the game by paying the entry fee
  const enterGame = async () => {
    if (!contract || !account) return

    try {
      const tx = await contract.enterGame({
        value: ethers.parseEther("0.001"),
      })
      await tx.wait()
      setHasEntered(true)
      await refreshGameInfo(contract)
    } catch (error) {
      console.error("Error entering game:", error)
    }
  }

  // Submit score to the contract
  const submitScore = async (score: number) => {
    if (!contract || !account || !hasEntered) return

    try {
      const tx = await contract.submitScore(score)
      await tx.wait()
      await refreshGameInfo(contract)
      alert(`Score of ${score} submitted to the blockchain!`)
    } catch (error) {
      console.error("Error submitting score:", error)
    }
  }

  // Update time remaining
  useEffect(() => {
    if (!timeRemaining || !contract) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (contract) refreshGameInfo(contract)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, contract, refreshGameInfo]) // Added refreshGameInfo to dependencies

  // Handle game over
  const handleGameOver = (finalScore: number) => {
    setScore(finalScore)
    setGameOver(true)
    setGameStarted(false)
  }

  // Start a new game
  const startNewGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gradient-to-b from-blue-900 to-blue-700">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center text-white mb-4">Crypto Flappy Bird</h1>

        {!account && <FeaturedPreview />}

        {!account ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg mt-6">
            <p className="text-xl text-white mb-4">Connect your wallet to play and win KITE tokens!</p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full flex items-center"
            >
              <Wallet className="mr-2" /> Connect MetaMask
            </button>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg mt-6">
            <p className="text-xl text-white mb-4">Please switch to the KiteAI Testnet to play</p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full"
            >
              Switch Network
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="flex flex-wrap justify-center gap-4 mb-6 w-full">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-lg flex items-center">
                <Wallet className="mr-2 text-white" />
                <span className="text-white">
                  {account.substring(0, 6)}...{account.substring(38)}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-lg flex items-center">
                <Coins className="mr-2 text-yellow-400" />
                <span className="text-white">Prize Pool: {gameInfo?.prizePool || "0"} KITE</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-lg flex items-center">
                <Trophy className="mr-2 text-yellow-400" />
                <span className="text-white">Highest Score: {gameInfo?.highestScore || "0"}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-lg flex items-center">
                <Clock className="mr-2 text-white" />
                <span className="text-white">Time Left: {formatTimeRemaining(timeRemaining)}</span>
              </div>
            </div>

            {!hasEntered ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg mb-6">
                <p className="text-xl text-white mb-4">Pay 0.001 KITE to enter the current game</p>
                <button
                  onClick={enterGame}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full"
                >
                  Enter Game (0.001 KITE)
                </button>
              </div>
            ) : !gameStarted && !gameOver ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg mb-6">
                <p className="text-xl text-white mb-4">You've entered the game! Ready to play?</p>
                <button
                  onClick={startNewGame}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full"
                >
                  Start Game
                </button>
              </div>
            ) : gameOver ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg mb-6">
                <p className="text-2xl text-white mb-2">Game Over!</p>
                <p className="text-xl text-white mb-4">Your Score: {score}</p>
                <div className="flex gap-4">
                  <button
                    onClick={startNewGame}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => submitScore(score)}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full"
                  >
                    Submit Score
                  </button>
                </div>
              </div>
            ) : null}

            <Leaderboard contract={contract} />

            <div className="w-full max-w-2xl aspect-[4/3] bg-sky-300 rounded-lg overflow-hidden shadow-2xl mt-6">
              {gameStarted && <Game onGameOver={handleGameOver} selectedSkin={selectedSkin} />}
              {!gameStarted && (
                <div className="w-full h-full flex items-center justify-center bg-sky-300">
                  <div className="text-center">
                    {!gameOver ? <p className="text-2xl font-bold text-blue-900">Press Start to Play</p> : null}
                  </div>
                </div>
              )}
            </div>
            <SkinShop contract={contract} account={account} />
          </div>
        )}
      </div>
    </main>
  )
}

