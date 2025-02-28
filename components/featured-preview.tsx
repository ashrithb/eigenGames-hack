"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import Link from "next/link"

const featuredBirds = [
  {
    id: 1,
    name: "Speed Demon",
    description: "A lightning-fast bird that moves 10% faster",
    rarity: "Rare",
    price: "0.1 KITE",
    abilities: ["10% Movement Speed"],
    colors: {
      body: "#FFB302",
      wing: "#FF9102",
      beak: "#FF6B02",
    },
    background: "bg-gradient-to-br from-yellow-400 to-orange-600",
  },
  {
    id: 2,
    name: "Golden Champion",
    description: "Double your score on the last day",
    rarity: "Legendary",
    price: "0.5 KITE",
    abilities: ["2x Last Day Score"],
    colors: {
      body: "#FFD700",
      wing: "#FFC700",
      beak: "#FFB700",
    },
    background: "bg-gradient-to-br from-yellow-300 to-amber-500",
  },
  {
    id: 3,
    name: "Royal Phoenix",
    description: "One free revival per game",
    rarity: "Mythical",
    price: "0.75 KITE",
    abilities: ["1 Free Revival"],
    colors: {
      body: "#FF4D4D",
      wing: "#FF3333",
      beak: "#FF1A1A",
    },
    background: "bg-gradient-to-br from-red-400 to-purple-600",
  },
]

const rarityColors = {
  Common: "bg-gray-500",
  Rare: "bg-blue-500",
  Epic: "bg-purple-500",
  Legendary: "bg-yellow-500",
  Mythical: "bg-red-500",
}

export default function FeaturedPreview() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Featured Birds</h2>
        <p className="text-white/80">Exclusive birds with unique abilities</p>
        <Link
          href="/featured-birds"
          className="inline-block mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full"
        >
          View All Birds
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredBirds.map((bird) => (
          <Card key={bird.id} className="overflow-hidden border-0 bg-white/10 backdrop-blur-sm text-white">
            <CardHeader className={`${bird.background} p-6`}>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{bird.name}</CardTitle>
                <Badge className={`${rarityColors[bird.rarity as keyof typeof rarityColors]}`}>{bird.rarity}</Badge>
              </div>
              <CardDescription className="text-white/90 mt-2">{bird.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="aspect-square mb-4 rounded-lg overflow-hidden relative">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full relative" style={{ backgroundColor: bird.colors.body }}>
                    {/* Wing */}
                    <div
                      className="absolute w-10 h-6 rounded-full -left-2 top-5 transform -rotate-45"
                      style={{ backgroundColor: bird.colors.wing }}
                    />
                    {/* Beak */}
                    <div
                      className="absolute w-6 h-6 right-0 top-5 transform rotate-45"
                      style={{
                        backgroundColor: bird.colors.beak,
                        clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                      }}
                    />
                    {/* Eye */}
                    <div className="absolute w-3 h-3 rounded-full right-3 top-3" style={{ backgroundColor: "#000" }} />
                  </div>
                </div>
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
    </div>
  )
}

