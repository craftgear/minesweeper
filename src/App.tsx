import './App.css'
import { useState } from 'react'

const BOARD_SIZE = 16
const MINE_COUNT = BOARD_SIZE * BOARD_SIZE * 0.12

type Cell = {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborCount: number
}

const createBoard = () => {
  const board: Cell[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }))
  )

  let minesPlaced = 0
  while (minesPlaced < MINE_COUNT) {
    const row = Math.floor(Math.random() * BOARD_SIZE)
    const col = Math.floor(Math.random() * BOARD_SIZE)
    if (!board[row][col].isMine) {
      board[row][col].isMine = true
      minesPlaced++
    }
  }

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!board[row][col].isMine) {
        let count = 0
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i
            const newCol = col + j
            if (
              newRow >= 0 &&
              newRow < BOARD_SIZE &&
              newCol >= 0 &&
              newCol < BOARD_SIZE &&
              board[newRow][newCol].isMine
            ) {
              count++
            }
          }
        }
        board[row][col].neighborCount = count
      }
    }
  }

  return board
}

// BFS
const revealEmptyCellsWithQueue = (board: Cell[][], row: number, col: number) => {
  const queue = [[row, col]]
  while (queue.length > 0) {
    const [currentRow, currentCol] = queue.shift() as [number, number]
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (j === 0 && i === 0) continue
        const newRow = currentRow + i
        const newCol = currentCol + j
        if (
          newRow >= 0 &&
          newRow < BOARD_SIZE &&
          newCol >= 0 &&
          newCol < BOARD_SIZE &&
          !board[newRow][newCol].isRevealed
        ) {
          board[newRow][newCol].isRevealed = true
          if (board[newRow][newCol].neighborCount === 0) {
            queue.push([newRow, newCol])
          }
        }
      }
    }
  }
}

const Board = () => {
  const [board, setBoard] = useState(createBoard())
  const [gameOver, setGameOver] = useState(false)

  const handleCellClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    setBoard((prevBoard) => {
      const newBoard = structuredClone(prevBoard)
      const cell = newBoard[row][col]

      if (cell.isFlagged || cell.isRevealed) {
        return prevBoard
      }

      cell.isRevealed = true

      if (cell.isMine) {
        setGameOver(true)
      } else if (cell.neighborCount === 0) {
        revealEmptyCellsWithQueue(newBoard, row, col)
      }

      return newBoard
    })
  }



  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    setBoard((prevBoard) => {
      const newBoard = structuredClone(prevBoard)
      const cell = newBoard[row][col]
      if (!cell.isRevealed) {
        cell.isFlagged = !cell.isFlagged
      }
      return newBoard
    })
  }

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return '🚩'
    if (!cell.isRevealed) return ''
    if (cell.isMine) return '💣'
    return cell.neighborCount > 0 ? cell.neighborCount : ''
  }

  return (
    <>
      {gameOver && <h1 className="text-red-500 text-2xl mb-4">Game Over!</h1>}
      <div className="grid">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => {
              const cls = `text-black w-8 h-8 border border-r-gray-800 border-b-gray-800 flex items-center justify-center transition-colors
                  ${cell.isRevealed ? 'bg-green-200' : 'bg-gray-400'}
                  ${cell.isRevealed && cell.isMine ? 'bg-red-500' : ''}
                  ${!cell.isRevealed ? 'hover:bg-gray-300' : ''}`
              return (
                <button
                  type="button"
                  key={colIndex}
                  className={cls}
                  onClick={(e) => handleCellClick(e, rowIndex, colIndex)}
                  onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                >
                  {getCellContent(cell)}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}

function App() {
  return (
    <div className="h-svh w-svw grid place-items-center bg-gray-100">
      <div className="p-4 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Minesweeper</h1>
        <Board />
      </div>
    </div>
  )
}

export default App
