import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Trophy, Crown, Timer, Target, Coins, Sparkles } from "lucide-react"

const featuredBirds = [
  {
    id: 1,
    name: "Speed Demon",
    description: "A lightning-fast bird that moves 10% faster through the pipes",
    rarity: "Rare",
    price: "0.1 KITE",
    abilities: ["10% Movement Speed", "5% Score Bonus"],
    background: "bg-gradient-to-br from-yellow-400 to-orange-600",
    icon: Zap,
  },
  {
    id: 2,
    name: "Golden Champion",
    description: "Double your score when winning on the last day of competition",
    rarity: "Legendary",
    price: "0.5 KITE",
    abilities: ["2x Last Day Score", "15% Prize Bonus"],
    background: "bg-gradient-to-br from-yellow-300 to-amber-500",
    icon: Trophy,
  },
  {
    id: 3,
    name: "Royal Phoenix",
    description: "One free revival per game when hitting pipes",
    rarity: "Mythical",
    price: "0.75 KITE",
    abilities: ["1 Free Revival", "10% Score Bonus"],
    background: "bg-gradient-to-br from-red-400 to-purple-600",
    icon: Crown,
  },
  {
    id: 4,
    name: "Time Warper",
    description: "Slows down pipe movement speed by 15%",
    rarity: "Epic",
    price: "0.3 KITE",
    abilities: ["15% Slower Pipes", "Wider Pipe Gaps"],
    background: "bg-gradient-to-br from-blue-400 to-indigo-600",
    icon: Timer,
  },
  {
    id: 5,
    name: "Score Striker",
    description: "Earn double points for every 5th pipe passed",
    rarity: "Rare",
    price: "0.2 KITE",
    abilities: ["2x Every 5th Point", "Bonus Point Streaks"],
    background: "bg-gradient-to-br from-green-400 to-emerald-600",
    icon: Target,
  },
  {
    id: 6,
    name: "Fortune Flapper",
    description: "15% chance to earn double KITE tokens from victories",
    rarity: "Epic",
    price: "0.4 KITE",
    abilities: ["15% Double Rewards", "5% Score Bonus"],
    background: "bg-gradient-to-br from-purple-400 to-pink-600",
    icon: Coins,
  },
]

const rarityColors = {
  Common: "bg-gray-500",
  Rare: "bg-blue-500",
  Epic: "bg-purple-500",
  Legendary: "bg-yellow-500",
  Mythical: "bg-red-500",
}

export default function FeaturedBirds() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Featured Birds Collection</h1>
          <p className="text-xl text-white/80">Exclusive birds with unique abilities to enhance your gameplay</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBirds.map((bird) => (
            <Card key={bird.id} className="overflow-hidden border-0 bg-white/10 backdrop-blur-sm text-white">
              <CardHeader className={`${bird.background} p-6`}>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold">{bird.name}</CardTitle>
                  <Badge className={`${rarityColors[bird.rarity as keyof typeof rarityColors]}`}>{bird.rarity}</Badge>
                </div>
                <CardDescription className="text-white/90 mt-2">{bird.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <bird.icon className="w-5 h-5" />
                  <span className="font-semibold">{bird.price}</span>
                </div>
                <div className="space-y-2">
                  {bird.abilities.map((ability, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>{ability}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/80 text-sm">
            * All featured birds are unique NFTs with special abilities that enhance your gameplay experience. Abilities
            stack with regular game mechanics and can be combined with other bird effects.
          </p>
        </div>
      </div>
    </div>
  )
}

