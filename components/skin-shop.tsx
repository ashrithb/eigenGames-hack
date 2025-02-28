"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { skins } from "@/lib/contract"
import { Coins, Check } from "lucide-react"

interface SkinShopProps {
  contract: ethers.Contract | null
  account: string | null
}

export default function SkinShop({ contract, account }: SkinShopProps) {
  const [ownedSkins, setOwnedSkins] = useState<number[]>([])
  const [selectedSkin, setSelectedSkin] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!contract || !account) return

    const fetchSkinData = async () => {
      try {
        const owned = await contract.getPlayerSkins(account)
        setOwnedSkins(owned.map((id: ethers.BigNumber) => Number(id)))
        const current = await contract.getCurrentSkin(account)
        setSelectedSkin(Number(current))
      } catch (error) {
        console.error("Error fetching skin data:", error)
      }
    }

    fetchSkinData()
  }, [contract, account])

  const purchaseSkin = async (skinId: number) => {
    if (!contract || !account) return
    setLoading(true)

    try {
      const skin = skins[skinId]
      const tx = await contract.purchaseSkin(skinId, {
        value: ethers.parseEther(skin.price),
      })
      await tx.wait()
      setOwnedSkins([...ownedSkins, skinId])
    } catch (error) {
      console.error("Error purchasing skin:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectSkin = async (skinId: number) => {
    if (!contract || !account) return
    setLoading(true)

    try {
      const tx = await contract.selectSkin(skinId)
      await tx.wait()
      setSelectedSkin(skinId)
    } catch (error) {
      console.error("Error selecting skin:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Bird Skins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skins.map((skin) => (
            <div
              key={skin.id}
              className={`p-4 rounded-lg border-2 ${selectedSkin === skin.id ? "border-green-500" : "border-gray-200"}`}
            >
              <div
                className="aspect-square mb-4 rounded-lg overflow-hidden relative"
                style={{ backgroundColor: skin.background }}
              >
                {skin.image ? (
                  <img
                    src={`https://ipfs.io/ipfs/${skin.image}`}
                    alt={skin.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full relative" style={{ backgroundColor: skin.colors.body }}>
                      {/* Wing */}
                      <div
                        className="absolute w-12 h-8 rounded-full -left-2 top-6 transform -rotate-45"
                        style={{ backgroundColor: skin.colors.wing }}
                      />
                      {/* Beak */}
                      <div
                        className="absolute w-8 h-8 right-0 top-6 transform rotate-45"
                        style={{
                          backgroundColor: skin.colors.beak,
                          clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                        }}
                      />
                      {/* Eye */}
                      <div
                        className="absolute w-4 h-4 rounded-full right-4 top-4"
                        style={{ backgroundColor: "#000" }}
                      />
                    </div>
                  </div>
                )}
                {selectedSkin === skin.id && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">{skin.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{skin.description}</p>
              {Number(skin.price) > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <Coins className="w-4 h-4" />
                  <span>{skin.price} KITE</span>
                </div>
              )}
              {ownedSkins.includes(skin.id) ? (
                <Button
                  className="w-full"
                  variant={selectedSkin === skin.id ? "secondary" : "default"}
                  disabled={loading || selectedSkin === skin.id}
                  onClick={() => selectSkin(skin.id)}
                >
                  {selectedSkin === skin.id ? "Selected" : "Select"}
                </Button>
              ) : (
                <Button className="w-full" disabled={loading} onClick={() => purchaseSkin(skin.id)}>
                  {Number(skin.price) > 0 ? `Buy for ${skin.price} KITE` : "Free"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

