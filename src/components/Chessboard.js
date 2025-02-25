import React, { useState, useEffect, useRef } from 'react';
import './Chessboard.css';

// Political piece mappings - map to image filenames
const PLAYER_IMAGE_MAPPINGS = {
  // Red team
  'Vivek Ramaswamy': 'vivek',
  'Ted Cruz': 'cruz',
  'Elon Musk': 'elon',
  'Ron DeSantis': 'desantis',
  'Rand Paul': 'rand',
  'Kash Patel': 'patel',
  'Pam Bondi': 'bondi',
  'Donald Trump': 'trump',
  'Matt Gaetz': 'gaetz',
  'RFK Jr.': 'RFK Jr',
  'Marjorie Taylor Greene': 'greene',
  'Josh Hawley': 'hawley',
  'Jim Jordan': 'jordan',
  'Lauren Boebert': 'boebert',
  'Greg Abbott': 'abbott',
  'Tim Scott': 'scott',
  
  // Blue team
  'Nancy Pelosi': 'pelosi',
  'Chuck Schumer': 'schumer',
  'AOC': 'aoc',
  'Bernie Sanders': 'bernie',
  'Elizabeth Warren': 'warren',
  'Pete Buttigieg': 'pete',
  'Kamala Harris': 'harris',
  'Barack Obama': 'obama',
  'Justin Trudeau': 'trudeau',
  'Gavin Newsom': 'newsom',
  'Joe Biden': 'biden',
  'Hillary Clinton': 'clinton',
  'Maxine Waters': 'waters',
  'Ilhan Omar': 'omar',
  'John Fetterman': 'fetterman',
  'Gretchen Whitmer': 'whitmer'
};

// Political piece mappings
const PIECE_MAPPINGS = {
  RED: {
    r: [
      { name: 'Vivek Ramaswamy', position: 'a1' },
      { name: 'Ted Cruz', position: 'h1' }
    ],
    n: [
      { name: 'Elon Musk', position: 'b1' },
      { name: 'Ron DeSantis', position: 'g1' }
    ],
    b: [
      { name: 'Rand Paul', position: 'c1' },
      { name: 'Kash Patel', position: 'f1' }
    ],
    q: [{ name: 'Pam Bondi', position: 'd1' }],
    k: [{ name: 'Donald Trump', position: 'e1' }],
    p: [
      { name: 'Matt Gaetz', position: 'a2' },
      { name: 'RFK Jr.', position: 'b2' },
      { name: 'Marjorie Taylor Greene', position: 'c2' },
      { name: 'Josh Hawley', position: 'd2' },
      { name: 'Jim Jordan', position: 'e2' },
      { name: 'Lauren Boebert', position: 'f2' },
      { name: 'Greg Abbott', position: 'g2' },
      { name: 'Tim Scott', position: 'h2' }
    ]
  },
  BLUE: {
    p: [
      { name: 'Justin Trudeau', position: 'a7' },
      { name: 'Gavin Newsom', position: 'b7' },
      { name: 'Joe Biden', position: 'c7' },
      { name: 'Hillary Clinton', position: 'd7' },
      { name: 'Maxine Waters', position: 'e7' },
      { name: 'Ilhan Omar', position: 'f7' },
      { name: 'John Fetterman', position: 'g7' },
      { name: 'Gretchen Whitmer', position: 'h7' }
    ],
    r: [
      { name: 'Nancy Pelosi', position: 'a8' },
      { name: 'Chuck Schumer', position: 'h8' }
    ],
    n: [
      { name: 'AOC', position: 'b8' },
      { name: 'Bernie Sanders', position: 'g8' }
    ],
    b: [
      { name: 'Elizabeth Warren', position: 'c8' },
      { name: 'Pete Buttigieg', position: 'f8' }
    ],
    q: [{ name: 'Kamala Harris', position: 'd8' }],
    k: [{ name: 'Barack Obama', position: 'e8' }]
  }
};

const Chessboard = () => {
  // Board representation: 8x8 2D array
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [turn, setTurn] = useState('red'); // red or blue
  const [capturedPieces, setCapturedPieces] = useState(() => ({ red: [], blue: [] }));
  const [gameStatus, setGameStatus] = useState('active'); // 'active', 'red-wins', 'blue-wins'
  const [winner, setWinner] = useState(null); // null, 'red', or 'blue'
  const [hoveredPiece, setHoveredPiece] = useState(null); // To track which piece is being hovered
  const [capturedPiecePopup, setCapturedPiecePopup] = useState(null); // To show popup when piece is captured
  const [hoveredCapturedPiece, setHoveredCapturedPiece] = useState(null); // To track hovered captured piece for meme
  const [memeCounter, setMemeCounter] = useState({}); // To track which meme version to show for each piece
  const [isDarkTheme, setIsDarkTheme] = useState(true); // New state for theme tracking
  const [volume, setVolume] = useState(0.5); // Volume state (0 to 1)
  const [isMuted, setIsMuted] = useState(false); // Mute state
  const [gameMode, setGameMode] = useState('human'); // 'human' or 'computer'
  const [computerColor, setComputerColor] = useState('blue'); // Computer plays as blue by default
  
  // Audio ref for background music
  const audioRef = useRef(null);

  // Initialize the board
  useEffect(() => {
    initializeBoard();
  }, []);
  
  const initializeBoard = () => {
    // Create an empty 8x8 board
    const newBoard = Array(8).fill().map(() => Array(8).fill(null));
    
    // Setup red pieces (black in standard chess)
    // Back row
    newBoard[0][0] = { type: 'r', color: 'red', name: 'Vivek Ramaswamy' };
    newBoard[0][1] = { type: 'n', color: 'red', name: 'Elon Musk' };
    newBoard[0][2] = { type: 'b', color: 'red', name: 'Rand Paul' };
    newBoard[0][3] = { type: 'q', color: 'red', name: 'Pam Bondi' };
    newBoard[0][4] = { type: 'k', color: 'red', name: 'Donald Trump' };
    newBoard[0][5] = { type: 'b', color: 'red', name: 'Kash Patel' };
    newBoard[0][6] = { type: 'n', color: 'red', name: 'Ron DeSantis' };
    newBoard[0][7] = { type: 'r', color: 'red', name: 'Ted Cruz' };
    
    // Pawns
    newBoard[1][0] = { type: 'p', color: 'red', name: 'Matt Gaetz' };
    newBoard[1][1] = { type: 'p', color: 'red', name: 'RFK Jr.' };
    newBoard[1][2] = { type: 'p', color: 'red', name: 'Marjorie Taylor Greene' };
    newBoard[1][3] = { type: 'p', color: 'red', name: 'Josh Hawley' };
    newBoard[1][4] = { type: 'p', color: 'red', name: 'Jim Jordan' };
    newBoard[1][5] = { type: 'p', color: 'red', name: 'Lauren Boebert' };
    newBoard[1][6] = { type: 'p', color: 'red', name: 'Greg Abbott' };
    newBoard[1][7] = { type: 'p', color: 'red', name: 'Tim Scott' };
    
    // Setup blue pieces (white in standard chess)
    // Back row
    newBoard[7][0] = { type: 'r', color: 'blue', name: 'Nancy Pelosi' };
    newBoard[7][1] = { type: 'n', color: 'blue', name: 'AOC' };
    newBoard[7][2] = { type: 'b', color: 'blue', name: 'Elizabeth Warren' };
    newBoard[7][3] = { type: 'q', color: 'blue', name: 'Kamala Harris' };
    newBoard[7][4] = { type: 'k', color: 'blue', name: 'Barack Obama' };
    newBoard[7][5] = { type: 'b', color: 'blue', name: 'Pete Buttigieg' };
    newBoard[7][6] = { type: 'n', color: 'blue', name: 'Bernie Sanders' };
    newBoard[7][7] = { type: 'r', color: 'blue', name: 'Chuck Schumer' };
    
    // Pawns
    newBoard[6][0] = { type: 'p', color: 'blue', name: 'Justin Trudeau' };
    newBoard[6][1] = { type: 'p', color: 'blue', name: 'Gavin Newsom' };
    newBoard[6][2] = { type: 'p', color: 'blue', name: 'Joe Biden' };
    newBoard[6][3] = { type: 'p', color: 'blue', name: 'Hillary Clinton' };
    newBoard[6][4] = { type: 'p', color: 'blue', name: 'Maxine Waters' };
    newBoard[6][5] = { type: 'p', color: 'blue', name: 'Ilhan Omar' };
    newBoard[6][6] = { type: 'p', color: 'blue', name: 'John Fetterman' };
    newBoard[6][7] = { type: 'p', color: 'blue', name: 'Gretchen Whitmer' };
    
    setBoard(newBoard);
    setGameStatus('active');
    setWinner(null);
    setSelectedPiece(null);
    setLegalMoves([]);
    setTurn('red');
    setCapturedPieces({ red: [], blue: [] });
  };
  
  // Is position valid on the board?
  const isValidPosition = (row, col) => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };
  
  // Get legal moves for a piece
  const getLegalMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece || piece.color !== turn) return [];
    
    const moves = [];
    
    switch(piece.type) {
      case 'p': // Pawn
        // Different movement for red (moves down) and blue (moves up)
        const direction = piece.color === 'red' ? 1 : -1;
        const startRow = piece.color === 'red' ? 1 : 6;
        
        // Move forward one square
        if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
          moves.push([row + direction, col]);
          
          // First move can be two spaces
          if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push([row + 2 * direction, col]);
          }
        }
        
        // Capture diagonally
        if (isValidPosition(row + direction, col - 1) && 
            board[row + direction][col - 1] && 
            board[row + direction][col - 1].color !== piece.color) {
          moves.push([row + direction, col - 1]);
        }
        
        if (isValidPosition(row + direction, col + 1) && 
            board[row + direction][col + 1] && 
            board[row + direction][col + 1].color !== piece.color) {
          moves.push([row + direction, col + 1]);
        }
        break;
        
      case 'r': // Rook
        // Four directions: up, right, down, left
        const rookDirections = [[-1, 0], [0, 1], [1, 0], [0, -1]];
        
        for (const [dr, dc] of rookDirections) {
          let newRow = row + dr;
          let newCol = col + dc;
          
          while (isValidPosition(newRow, newCol)) {
            if (!board[newRow][newCol]) {
              moves.push([newRow, newCol]);
            } else {
              if (board[newRow][newCol].color !== piece.color) {
                moves.push([newRow, newCol]);
              }
              break; // Can't move past a piece
            }
            newRow += dr;
            newCol += dc;
          }
        }
        break;
        
      case 'n': // Knight
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dr, dc] of knightMoves) {
          const newRow = row + dr;
          const newCol = col + dc;
          
          if (isValidPosition(newRow, newCol) && 
              (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color)) {
            moves.push([newRow, newCol]);
          }
        }
        break;
        
      case 'b': // Bishop
        const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dr, dc] of bishopDirections) {
          let newRow = row + dr;
          let newCol = col + dc;
          
          while (isValidPosition(newRow, newCol)) {
            if (!board[newRow][newCol]) {
              moves.push([newRow, newCol]);
            } else {
              if (board[newRow][newCol].color !== piece.color) {
                moves.push([newRow, newCol]);
              }
              break; // Can't move past a piece
            }
            newRow += dr;
            newCol += dc;
          }
        }
        break;
        
      case 'q': // Queen (combination of rook and bishop)
        const queenDirections = [
          [-1, -1], [-1, 0], [-1, 1], [0, -1],
          [0, 1], [1, -1], [1, 0], [1, 1]
        ];
        
        for (const [dr, dc] of queenDirections) {
          let newRow = row + dr;
          let newCol = col + dc;
          
          while (isValidPosition(newRow, newCol)) {
            if (!board[newRow][newCol]) {
              moves.push([newRow, newCol]);
            } else {
              if (board[newRow][newCol].color !== piece.color) {
                moves.push([newRow, newCol]);
              }
              break; // Can't move past a piece
            }
            newRow += dr;
            newCol += dc;
          }
        }
        break;
        
      case 'k': // King
        const kingMoves = [
          [-1, -1], [-1, 0], [-1, 1], [0, -1],
          [0, 1], [1, -1], [1, 0], [1, 1]
        ];
        
        for (const [dr, dc] of kingMoves) {
          const newRow = row + dr;
          const newCol = col + dc;
          
          if (isValidPosition(newRow, newCol) && 
              (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color)) {
            moves.push([newRow, newCol]);
          }
        }
        break;
        
      default:
        break;
    }
    
    return moves;
  };

  // Check if a king is captured
  const checkForWin = (capturedPiece) => {
    if (capturedPiece && capturedPiece.type === 'k') {
      const winningColor = capturedPiece.color === 'red' ? 'blue' : 'red';
      setGameStatus(`${winningColor}-wins`);
      setWinner(winningColor);
      return true;
    }
    return false;
  };
  
  // Reset the game to initial state
  const resetGame = () => {
    initializeBoard();
    setSelectedPiece(null);
    setLegalMoves([]);
    setCapturedPieces(() => ({ red: [], blue: [] }));
    setTurn('red');
    setWinner(null);
    setGameStatus('active');
    setCapturedPiecePopup(null);
    setMemeCounter({});
    
    // If computer plays as red, trigger its move after a short delay
    if (gameMode === 'computer' && computerColor === 'red') {
      setTimeout(() => {
        // The game needs to be fully initialized before we make a computer move
        makeComputerMove();
      }, 1000);
    }
  };
  
  // Handle square click
  const handleSquareClick = (row, col) => {
    // Don't allow moves if game is over
    if (gameStatus !== 'active') return;

    // If the capture popup is showing, clicking anywhere should dismiss it
    if (capturedPiecePopup) {
      setCapturedPiecePopup(null);
      return;
    }

    // If a piece is already selected
    if (selectedPiece) {
      const [selectedRow, selectedCol] = selectedPiece;
      const moves = getLegalMoves(selectedRow, selectedCol);
      
      // Check if the clicked square is a valid move
      const isLegalMove = moves.some(([r, c]) => r === row && c === col);
      
      if (isLegalMove) {
        // Execute the move
        const newBoard = [...board.map(row => [...row])];
        
        // Check if we're capturing a piece
        let kingCaptured = false;
        let capturedPiece = null;
        
        if (newBoard[row][col]) {
          capturedPiece = newBoard[row][col];
          
          // Check if the captured piece is a king
          kingCaptured = checkForWin(capturedPiece);
        }
        
        // Move the piece
        newBoard[row][col] = newBoard[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = null;
        
        // Update board
        setBoard(newBoard);
        
        // Show captured piece popup if there was a capture and the game isn't over
        if (capturedPiece && !kingCaptured) {
          showCapturedPiecePopup(capturedPiece);
          
          // Add to captured pieces after popup is shown
          setCapturedPieces(prev => ({
            ...prev,
            [turn]: [...prev[turn], capturedPiece]
          }));
          
          // Don't switch turns yet - will switch after popup is dismissed
        } else {
          // If no capture or game is over, handle normally
          if (capturedPiece) {
            setCapturedPieces(prev => ({
              ...prev,
              [turn]: [...prev[turn], capturedPiece]
            }));
          }
          
          // Only switch turns if the game isn't over
          if (!kingCaptured) {
            setTurn(turn === 'red' ? 'blue' : 'red');
          }
        }
      }
      
      // Reset selection and legal moves
      setSelectedPiece(null);
      setLegalMoves([]);
    } 
    // No piece selected yet, check if we can select the clicked square
    else {
      const piece = board[row][col];
      
      if (piece && piece.color === turn) {
        // Select this piece
        setSelectedPiece([row, col]);
        
        // Show legal moves
        setLegalMoves(getLegalMoves(row, col));
      }
    }
  };
  
  // Show captured piece popup
  const showCapturedPiecePopup = (piece) => {
    // Initialize meme counter for this piece if not exists
    if (!memeCounter[piece.name]) {
      setMemeCounter(prev => ({
        ...prev,
        [piece.name]: Math.floor(Math.random() * 3) + 1 // Start with random meme (1-3)
      }));
    }
    
    setCapturedPiecePopup(piece);
  };
  
  // Handle popup click
  const handlePopupClick = () => {
    // Cycle to next meme for this piece before dismissing
    if (capturedPiecePopup && capturedPiecePopup.name) {
      cycleToNextMeme(capturedPiecePopup.name);
    }
    
    // Dismiss popup and switch turns
    setCapturedPiecePopup(null);
    setTurn(turn === 'red' ? 'blue' : 'red');
  };
  
  // Map piece type to full name for image URLs
  const getPieceImageName = (type) => {
    const typeMap = {
      'p': 'pawn',
      'r': 'rook',
      'n': 'knight',
      'b': 'bishop',
      'q': 'queen',
      'k': 'king'
    };
    return typeMap[type] || type;
  };
  
  // Get player image for a piece
  const getPlayerImagePath = (piece) => {
    if (!piece || !piece.name) return null;
    
    const imageBase = PLAYER_IMAGE_MAPPINGS[piece.name];
    if (!imageBase) return null;
    
    return `${process.env.PUBLIC_URL}/assets/players/${piece.color}/${imageBase}.jpg`;
  };
  
  // Get meme image for a captured piece with cycling
  const getMemeImagePath = (piece) => {
    if (!piece || !piece.name) return null;
    
    const imageBase = PLAYER_IMAGE_MAPPINGS[piece.name];
    if (!imageBase) return null;
    
    // Initialize counter for this piece if not exists
    if (!memeCounter[piece.name]) {
      setMemeCounter(prev => ({
        ...prev,
        [piece.name]: 1
      }));
    }
    
    // Get current counter value (1, 2, or 3)
    let currentCounter = memeCounter[piece.name] || 1;
    
    // Prepare the filename with the counter
    let filename;
    if (currentCounter === 1) {
      filename = `${imageBase}_meme.jpg`;
    } else {
      filename = `${imageBase}_meme${currentCounter}.jpg`;
    }
    
    return `${process.env.PUBLIC_URL}/assets/memes/${piece.color}/${filename}`;
  };
  
  // Cycle to the next meme for a piece
  const cycleToNextMeme = (pieceName) => {
    setMemeCounter(prev => {
      // Get current counter value (1, 2, or 3)
      const currentValue = prev[pieceName] || 1;
      
      // Cycle through 1, 2, 3, then back to 1
      const nextValue = currentValue >= 3 ? 1 : currentValue + 1;
      
      return {
        ...prev,
        [pieceName]: nextValue
      };
    });
  };
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    
    // Apply theme to the document body
    if (newTheme) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  };
  
  // Setup audio player
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
      audioRef.current.muted = isMuted;
      
      // Auto-play is often blocked by browsers
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Auto-play was prevented. User interaction required to play audio.");
        });
      }
    }
  }, [volume, isMuted]);

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    // If user increases volume from 0, unmute
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };
  
  // Computer move logic
  const makeComputerMove = () => {
    if (gameStatus !== 'active' || turn !== computerColor) return;
    
    // Slight delay to make the moves feel more natural
    setTimeout(() => {
      // Get all pieces of the computer's color
      const computerPieces = [];
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece && piece.color === computerColor) {
            computerPieces.push({ piece, row, col });
          }
        }
      }
      
      // Shuffle to add some randomness
      computerPieces.sort(() => Math.random() - 0.5);
      
      // Try to find a move that captures an opponent's piece
      let moveFound = false;
      
      // First, look for capturing moves
      for (const { piece, row, col } of computerPieces) {
        const moves = getLegalMoves(row, col);
        
        // Prioritize capturing moves
        const capturingMoves = moves.filter(([r, c]) => board[r][c] && board[r][c].color !== computerColor);
        
        if (capturingMoves.length > 0) {
          // Sort capturing moves by piece value (capture higher value pieces first)
          capturingMoves.sort(([r1, c1], [r2, c2]) => {
            const value1 = getPieceValue(board[r1][c1].type);
            const value2 = getPieceValue(board[r2][c2].type);
            return value2 - value1;
          });
          
          // Execute the best capturing move
          const [toRow, toCol] = capturingMoves[0];
          handleComputerMove(row, col, toRow, toCol);
          moveFound = true;
          break;
        }
      }
      
      // If no capturing move found, try any legal move
      if (!moveFound) {
        for (const { piece, row, col } of computerPieces) {
          const moves = getLegalMoves(row, col);
          
          if (moves.length > 0) {
            // Prioritize moves toward the opponent's side
            moves.sort(([r1, c1], [r2, c2]) => {
              // For blue (computer), moving toward row 0 is preferred
              // For red (computer), moving toward row 7 is preferred
              return computerColor === 'blue' ? r1 - r2 : r2 - r1;
            });
            
            const [toRow, toCol] = moves[0];
            handleComputerMove(row, col, toRow, toCol);
            moveFound = true;
            break;
          }
        }
      }
      
      // If still no move found (shouldn't happen in normal gameplay), make any move
      if (!moveFound) {
        console.log("Computer couldn't find a move!");
      }
    }, 500); // 500ms delay
  };
  
  // Helper function for computer to execute moves
  const handleComputerMove = (fromRow, fromCol, toRow, toCol) => {
    // This is similar to handleSquareClick but for computer moves
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];
    
    // Create a new board with the move applied
    const newBoard = [...board];
    
    // If a piece is captured, add it to captured pieces
    if (targetPiece) {
      // Update captured pieces with the structure { red: [], blue: [] }
      const newCapturedPieces = { ...capturedPieces };
      newCapturedPieces[targetPiece.color].push(targetPiece);
      setCapturedPieces(newCapturedPieces);
      
      // Show captured piece popup
      setCapturedPiecePopup({
        piece: targetPiece,
        position: { row: toRow, col: toCol }
      });
      
      // Hide the popup after a delay
      setTimeout(() => {
        setCapturedPiecePopup(null);
      }, 2000);
    }
    
    // Move piece
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    
    // Check if a king was captured (victory condition)
    if (targetPiece && targetPiece.type === 'k') {
      setWinner(piece.color);
      setGameStatus('checkmate');
    }
    
    // Update the board
    setBoard(newBoard);
    
    // Switch turns
    setTurn(turn === 'red' ? 'blue' : 'red');
  };

  // Helper function to determine piece value for AI decision making
  const getPieceValue = (pieceType) => {
    switch (pieceType) {
      case 'pawn': return 1;
      case 'knight': return 3;
      case 'bishop': return 3;
      case 'rook': return 5;
      case 'queen': return 9;
      case 'king': return 100; // High value to prioritize king capture
      default: return 0;
    }
  };
  
  // Trigger computer move after human moves
  useEffect(() => {
    if (gameMode === 'computer' && turn === computerColor && gameStatus === 'active') {
      makeComputerMove();
    }
  }, [turn, gameMode, computerColor, gameStatus]);

  // Toggle between human and computer opponent
  const toggleGameMode = () => {
    if (gameStatus !== 'active') {
      // Only allow changing mode when starting a new game
      const newMode = gameMode === 'human' ? 'computer' : 'human';
      setGameMode(newMode);
      
      // Reset the game when changing modes
      resetGame();
    }
  };
  
  // Toggle which color the computer plays as
  const toggleComputerColor = () => {
    if (gameStatus !== 'active' && gameMode === 'computer') {
      const newColor = computerColor === 'red' ? 'blue' : 'red';
      setComputerColor(newColor);
      
      // Reset the game when changing computer color
      resetGame();
    }
  };

  // Render a square on the board
  const renderSquare = (row, col) => {
    const piece = board[row][col];
    const isSelected = selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col;
    const isLegalMove = legalMoves.some(([r, c]) => r === row && c === col);
    const isLight = (row + col) % 2 === 0;
    
    return (
      <div
        key={`${row}-${col}`}
        className={`square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isLegalMove ? 'legal-move' : ''}`}
        onClick={() => handleSquareClick(row, col)}
        onMouseEnter={() => piece && setHoveredPiece(piece)}
        onMouseLeave={() => setHoveredPiece(null)}
      >
        {piece && (
          <div className="piece">
            <img
              src={`${process.env.PUBLIC_URL}/assets/pieces/${piece.color}/${getPieceImageName(piece.type)}_${piece.color}.png`}
              alt={`${piece.color} ${piece.type}`}
              className="piece-img"
            />
            <div className="piece-name">{piece.name}</div>
          </div>
        )}
        {hoveredPiece && ((piece && piece.name === hoveredPiece.name) || (!piece && isLegalMove)) && (
          <img
            src={getPlayerImagePath(hoveredPiece)}
            alt={hoveredPiece.name}
            className="player-image"
          />
        )}
      </div>
    );
  };
  
  // Render captured pieces
  const renderCapturedPieces = (color) => {
    return capturedPieces[color].map((piece, index) => (
      <div 
        key={`${color}-${piece.type}-${index}`} 
        className="captured-piece"
        onMouseEnter={() => {
          // Cycle to next meme when hovering
          cycleToNextMeme(piece.name);
          setHoveredCapturedPiece(piece);
        }}
        onMouseLeave={() => setHoveredCapturedPiece(null)}
        onClick={() => cycleToNextMeme(piece.name)}
      >
        <img
          src={`${process.env.PUBLIC_URL}/assets/pieces/${piece.color}/${getPieceImageName(piece.type)}_${piece.color}.png`}
          alt={`Captured ${piece.name}`}
          className="captured-piece-icon"
        />
        <div className="captured-piece-name">{piece.name}</div>
        
        {hoveredCapturedPiece === piece && (
          <div className="captured-meme-tooltip">
            <img 
              src={getMemeImagePath(piece)} 
              alt={`${piece.name} meme`} 
              className="captured-meme-image" 
            />
          </div>
        )}
      </div>
    ));
  };
  
  // Render the entire board
  const renderBoard = () => {
    return (
      <div className="board">
        {board.map((row, rowIndex) => (
          row.map((_, colIndex) => (
            renderSquare(rowIndex, colIndex)
          ))
        ))}
      </div>
    );
  };

  // Render winner overlay
  const renderWinnerOverlay = () => {
    if (gameStatus === 'active') return null;
    
    // Map color to party name
    const partyName = winner === 'red' ? 'REPUBLICANS' : 'DEMOCRATS';
    
    return (
      <div className="winner-overlay">
        <div className="winner-content">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/winner/golden_chainsaw.jpg`} 
            alt="Golden Chainsaw Trophy" 
            className="winner-trophy"
          />
          <h2>{partyName} WIN!</h2>
          <button onClick={resetGame} className="restart-button">Restart Game</button>
        </div>
      </div>
    );
  };
  
  // Render captured piece popup
  const renderCapturedPiecePopup = () => {
    if (!capturedPiecePopup) return null;
    
    return (
      <div className="captured-popup-overlay" onClick={handlePopupClick}>
        <div className="captured-popup-content">
          <img 
            src={getMemeImagePath(capturedPiecePopup)} 
            alt={`Captured ${capturedPiecePopup.name}`} 
            className="captured-popup-image"
          />
          <div className="captured-popup-name">{capturedPiecePopup.name} was captured!</div>
          <div className="captured-popup-instruction">Click anywhere to continue</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="game-container">
      {/* Background audio player */}
      <audio 
        ref={audioRef} 
        src={`${process.env.PUBLIC_URL}/assets/audio/politcal party lofi.mp3`} 
        loop
      />
      
      <div className="chessboard">
        {board.length > 0 ? renderBoard() : <div>Loading...</div>}
        {renderWinnerOverlay()}
        {renderCapturedPiecePopup()}
      </div>
      <div className="captured-pieces">
        <h3>Captured Pieces</h3>
        <div className="captured-red">
          <h4>Republicans Captured</h4>
          {renderCapturedPieces('red')}
        </div>
        <div className="captured-blue">
          <h4>Democrats Captured</h4>
          {renderCapturedPieces('blue')}
        </div>
        <div className="turn-info">
          <h3>Current Turn: {turn === 'red' ? 'REPUBLICANS' : 'DEMOCRATS'}</h3>
        </div>
        <div className="game-controls">
          <button className="theme-toggle-button" onClick={toggleTheme}>
            <span className="theme-toggle-icon">{isDarkTheme ? '☀️' : '🌙'}</span>
            {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="restart-button" onClick={resetGame}>
            Restart Game
          </button>
        </div>
        
        {/* Audio controls */}
        <div className="audio-controls">
          <button 
            className="mute-button" 
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={handleVolumeChange} 
            className="volume-slider"
            aria-label="Volume"
          />
        </div>
        
        {/* Game mode controls */}
        <div className="game-mode-controls">
          <div className="mode-toggle">
            <span className="mode-label">Game Mode:</span>
            <button 
              className={`mode-button ${gameMode === 'human' ? 'active' : ''}`} 
              onClick={toggleGameMode}
              disabled={gameStatus === 'active'}
            >
              {gameMode === 'human' ? '👥 Player vs Player' : '🧠 Player vs Computer'}
            </button>
          </div>
          
          {/* Only show computer color toggle in computer mode */}
          {gameMode === 'computer' && (
            <div className="computer-color-toggle">
              <span className="mode-label">Computer Plays As:</span>
              <button 
                className={`color-button ${computerColor === 'blue' ? 'blue-button' : 'red-button'}`}
                onClick={toggleComputerColor}
                disabled={gameStatus === 'active'}
              >
                {computerColor === 'blue' ? 'Democrats' : 'Republicans'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chessboard;
