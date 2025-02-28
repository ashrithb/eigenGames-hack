"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { skins } from "@/lib/contract"

interface GameProps {
  onGameOver: (score: number) => void
  selectedSkin?: number
}

export default function Game({ onGameOver, selectedSkin = 0 }: GameProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [birdPosition, setBirdPosition] = useState(250)
  const [velocity, setVelocity] = useState(0)
  const gameRef = useRef<HTMLDivElement>(null)
  const birdRef = useRef<HTMLDivElement>(null)
  const gameLoopRef = useRef<number>()
  const pipesRef = useRef<HTMLDivElement[]>([])
  const [pipes, setPipes] = useState<{ top: number; bottom: number; x: number; passed: boolean }[]>([])

  // Game constants
  const GRAVITY = 0.1
  const JUMP_FORCE = -3
  const PIPE_SPEED = 2
  const PIPE_SPAWN_RATE = 2500
  const PIPE_WIDTH = 60
  const GAME_HEIGHT = 600
  const PIPE_GAP = 200
  const BIRD_SIZE = 40 // Added bird size constant

  const createPipe = useCallback(() => {
    const minHeight = 50
    const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight

    return {
      top: topHeight,
      bottom: GAME_HEIGHT - topHeight - PIPE_GAP,
      x: 800,
      passed: false,
    }
  }, [])

  const jump = useCallback(() => {
    setVelocity(JUMP_FORCE)
    if (!gameStarted) {
      setGameStarted(true)
    }
  }, [gameStarted])

  const checkCollision = useCallback((birdRect: DOMRect, gameRect: DOMRect, pipes: HTMLDivElement[]) => {
    // Get bird position relative to game container
    const birdLeft = birdRect.left - gameRect.left
    const birdRight = birdLeft + BIRD_SIZE
    const birdTop = birdRect.top - gameRect.top
    const birdBottom = birdTop + BIRD_SIZE

    // Ground collision
    if (birdBottom > GAME_HEIGHT - 50) {
      return true
    }

    // Ceiling collision
    if (birdTop < 0) {
      return true
    }

    // Pipe collision
    for (const pipe of pipes) {
      if (!pipe) continue

      const pipeRect = pipe.getBoundingClientRect()
      const pipeLeft = pipeRect.left - gameRect.left
      const pipeRight = pipeLeft + PIPE_WIDTH

      // Only check collision if bird is within pipe's horizontal bounds
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        const topPipe = pipe.children[0] as HTMLElement
        const bottomPipe = pipe.children[1] as HTMLElement

        const topPipeHeight = Number.parseInt(topPipe.style.height)
        const bottomPipeTop = Number.parseInt(bottomPipe.style.top)

        // Check collision with top pipe
        if (birdTop < topPipeHeight) {
          return true
        }

        // Check collision with bottom pipe
        if (birdBottom > bottomPipeTop) {
          return true
        }
      }
    }

    return false
  }, [])

  const endGame = useCallback(() => {
    setGameStarted(false)
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
    onGameOver(score)
  }, [onGameOver, score])

  const startGame = useCallback(() => {
    setGameStarted(true)
    setBirdPosition(250)
    setVelocity(0)
    setScore(0)
    setPipes([
      { ...createPipe(), x: 400 },
      { ...createPipe(), x: 600 },
    ])
  }, [createPipe])

  // Game loop
  useEffect(() => {
    if (!gameStarted) return

    let lastTime = performance.now()
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16
      lastTime = currentTime

      setBirdPosition((prev) => {
        const newPosition = prev + velocity * deltaTime
        return Math.max(-20, newPosition)
      })

      setVelocity((prev) => {
        const newVelocity = prev + GRAVITY * deltaTime
        return Math.min(newVelocity, 15)
      })

      setPipes((prevPipes) => {
        const newPipes = prevPipes
          .map((pipe) => ({
            ...pipe,
            x: pipe.x - PIPE_SPEED * deltaTime,
          }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH)

        newPipes.forEach((pipe) => {
          if (!pipe.passed && pipe.x + PIPE_WIDTH < 100) {
            pipe.passed = true
            setScore((prev) => prev + 1)
          }
        })

        if (newPipes.length < 3 && (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 500)) {
          newPipes.push({
            ...createPipe(),
            x: 800,
          })
        }

        return newPipes
      })

      // Collision detection
      if (birdRef.current && gameRef.current) {
        const birdRect = birdRef.current.getBoundingClientRect()
        const gameRect = gameRef.current.getBoundingClientRect()
        const validPipes = pipesRef.current.filter(Boolean)

        if (checkCollision(birdRect, gameRect, validPipes)) {
          endGame()
          return
        }
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameStarted, velocity, checkCollision, createPipe, endGame])

  // Input handlers
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [jump])

  // Reset game
  useEffect(() => {
    if (!gameStarted) {
      setBirdPosition(250)
      setVelocity(0)
      setPipes([])
      setScore(0)
    }
  }, [gameStarted])

  const skinColors = skins[selectedSkin].colors
  const skinBackground = skins[selectedSkin].background

  return (
    <div
      ref={gameRef}
      className="relative w-full h-[600px] overflow-hidden cursor-pointer bg-sky-300"
      onClick={jump}
      style={{ backgroundColor: skinBackground }}
    >
      {/* Bird */}
      <div
        ref={birdRef}
        className="absolute left-20 w-10 h-10 transition-transform duration-75 z-10"
        style={{
          transform: `translateY(${birdPosition}px) rotate(${Math.min(Math.max(velocity * 3, -20), 20)}deg)`,
        }}
      >
        <div className="relative w-full h-full rounded-full" style={{ backgroundColor: skinColors.body }}>
          <div
            className="absolute w-6 h-4 rounded-full -left-1 top-3 transform -rotate-45"
            style={{ backgroundColor: skinColors.wing }}
          />
          <div
            className="absolute w-4 h-4 right-0 top-3 transform rotate-45"
            style={{
              backgroundColor: skinColors.beak,
              clipPath: "polygon(0 0, 100% 50%, 0 100%)",
            }}
          />
          <div className="absolute w-2 h-2 rounded-full right-2 top-2" style={{ backgroundColor: "#000" }} />
        </div>
      </div>

      {/* Pipes */}
      {pipes.map((pipe, index) => (
        <div
          key={`${index}-${pipe.x}`}
          ref={(el) => {
            if (el) pipesRef.current[index] = el
          }}
          className="absolute h-full"
          style={{ transform: `translateX(${pipe.x}px)`, width: PIPE_WIDTH }}
        >
          <div className="absolute top-0 w-full bg-green-500 border-4 border-green-600" style={{ height: pipe.top }}>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-green-600" />
          </div>
          <div
            className="absolute w-full bg-green-500 border-4 border-green-600"
            style={{ height: pipe.bottom, top: pipe.top + PIPE_GAP }}
          >
            <div className="absolute top-0 left-0 right-0 h-4 bg-green-600" />
          </div>
        </div>
      ))}

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-[50px] z-20">
        <div className="h-full bg-[#DED895]">
          <div className="h-4 bg-[#73BF2E]" />
        </div>
      </div>

      {/* Score */}
      <div className="absolute top-4 left-4 bg-white/70 px-3 py-1 rounded-full text-lg font-bold">{score}</div>

      {/* Start message */}
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 text-white px-4 py-2 rounded-full text-lg">
            Click, Tap or Press Space to start
          </div>
        </div>
      )}
    </div>
  )
}

