"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, History, Coins } from "lucide-react"

interface LeaderboardProps {
  contract: ethers.Contract | null
}

interface PlayerStats {
  playerAddress: string
  totalSpent: string
}

interface GameHistory {
  gameId: number
  winner: string
  score: number
  prizePool: string
  timestamp: number
  totalPlayers: number
}

const Leaderboard: React.FC<LeaderboardProps> = ({ contract }) => {
  const [topSpenders, setTopSpenders] = useState<PlayerStats[]>([])
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contract) return

    const fetchData = async () => {
      try {
        // Fetch top spenders
        const spenders = await contract.getTopSpenders()
        setTopSpenders(
          spenders.map((s: any) => ({
            playerAddress: s.playerAddress,
            totalSpent: ethers.formatEther(s.totalSpent),
          })),
        )

        // Fetch game history
        const history = await contract.getGameHistory()
        setGameHistory(
          history.map((h: any) => ({
            gameId: Number(h.gameId),
            winner: h.winner,
            score: Number(h.score),
            prizePool: ethers.formatEther(h.prizePool),
            timestamp: Number(h.timestamp),
            totalPlayers: Number(h.totalPlayers),
          })),
        )

        setLoading(false)
      } catch (error) {
        console.error("Error fetching leaderboard data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [contract])

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Leaderboard & History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spenders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spenders" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Top Spenders
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Game History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spenders">
            {loading ? (
              <div className="text-center py-4">Loading top spenders...</div>
            ) : topSpenders.length > 0 ? (
              <div className="space-y-4">
                {topSpenders.map((player, index) => (
                  <div
                    key={player.playerAddress}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">#{index + 1}</div>
                      <div>
                        <div className="font-semibold">{formatAddress(player.playerAddress)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold">{player.totalSpent} KITE</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">No players yet</div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {loading ? (
              <div className="text-center py-4">Loading game history...</div>
            ) : gameHistory.length > 0 ? (
              <div className="space-y-4">
                {gameHistory.map((game) => (
                  <div key={game.gameId} className="p-4 bg-secondary rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">Game #{game.gameId}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(game.timestamp)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Winner</div>
                        <div className="font-semibold">
                          {game.winner === ethers.ZeroAddress ? "No Winner" : formatAddress(game.winner)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Score</div>
                        <div className="font-semibold">{game.score}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Prize Pool</div>
                        <div className="font-semibold">{game.prizePool} KITE</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Players</div>
                        <div className="font-semibold">{game.totalPlayers}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">No game history yet</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default Leaderboard

