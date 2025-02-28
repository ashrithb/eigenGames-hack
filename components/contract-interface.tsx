"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { contractABI, contractAddress } from "@/lib/contract"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ContractInterfaceProps {
  account: string | null
  provider: ethers.BrowserProvider | null
}

const ContractInterface: React.FC<ContractInterfaceProps> = ({ account, provider }) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [gameInfo, setGameInfo] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [hasEntered, setHasEntered] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const initContract = async () => {
      if (!provider || !account) return

      try {
        const signer = await provider.getSigner()
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer)
        setContract(contractInstance)

        // Check if player has already entered
        const hasEntered = await contractInstance.hasPlayerEntered(account)
        setHasEntered(hasEntered)

        // Get game info
        await refreshGameInfo(contractInstance)
      } catch (error) {
        console.error("Error initializing contract:", error)
      }
    }

    initContract()
  }, [provider, account])

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

      if (account) {
        const hasEntered = await contractInstance.hasPlayerEntered(account)
        setHasEntered(hasEntered)
      }
    } catch (error) {
      console.error("Error fetching game info:", error)
    }
  }

  const enterGame = async () => {
    if (!contract || !account) return
    setLoading(true)

    try {
      const tx = await contract.enterGame({
        value: ethers.parseEther("0.001"),
      })
      await tx.wait()
      setHasEntered(true)
      await refreshGameInfo(contract)
    } catch (error) {
      console.error("Error entering game:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitScore = async (score: number) => {
    if (!contract || !account || !hasEntered) return
    setLoading(true)

    try {
      const tx = await contract.submitScore(score)
      await tx.wait()
      await refreshGameInfo(contract)
    } catch (error) {
      console.error("Error submitting score:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Game Information</CardTitle>
      </CardHeader>
      <CardContent>
        {gameInfo ? (
          <div className="space-y-2">
            <p>Game ID: {gameInfo.gameId.toString()}</p>
            <p>Prize Pool: {gameInfo.prizePool} KITE</p>
            <p>Highest Score: {gameInfo.highestScore}</p>
            <p>
              Current Winner:{" "}
              {gameInfo.currentWinner === ethers.ZeroAddress
                ? "None yet"
                : `${gameInfo.currentWinner.substring(0, 6)}...${gameInfo.currentWinner.substring(38)}`}
            </p>
            <p>Time Remaining: {formatTimeRemaining(timeRemaining)}</p>
            <p>Game Status: {gameInfo.gameInProgress ? "Active" : "Ended"}</p>

            {!hasEntered && (
              <Button onClick={enterGame} disabled={loading} className="w-full mt-4">
                {loading ? "Processing..." : "Enter Game (0.001 KITE)"}
              </Button>
            )}
          </div>
        ) : (
          <p>Loading game information...</p>
        )}
      </CardContent>
    </Card>
  )
}

export default ContractInterface

