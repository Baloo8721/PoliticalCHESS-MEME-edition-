import React, { useState, useEffect, useRef } from 'react';
import './Chessboard.css';

// Political piece mappings - map to image filenames
const PLAYER_IMAGE_MAPPINGS = {
  // Red team
  'Vivek Ramaswamy': 'vivek',
  'Ted Cruz': 'cruz',
  'Elon Musk': 'elon',
  'Ron DeSantis': 'desantis',
  'JD Vance': 'vance',
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
      { name: 'JD Vance', position: 'c1' }, // Updated from Rand Paul
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

// Meme mappings
const MEME_MAPPINGS = {
  'JD Vance': [
    `${process.env.PUBLIC_URL}/assets/memes/red/vance_meme.jpg`,
    `${process.env.PUBLIC_URL}/assets/memes/red/vance_meme2.jpg`,
    `${process.env.PUBLIC_URL}/assets/memes/red/vance_meme3.jpg`
  ],
  'Vivek Ramaswamy': [
    `${process.env.PUBLIC_URL}/assets/memes/red/vivek_meme.jpg`,
    `${process.env.PUBLIC_URL}/assets/memes/red/vivek_meme2.jpg`,
    `${process.env.PUBLIC_URL}/assets/memes/red/vivek_meme3.jpg`
  ],
  // ... rest of the meme mappings remain the same
};

const Chessboard = ({ initialGameCode = null }) => {
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
  const [capturingPiece, setCapturingPiece] = useState(null); // To track which piece did the capturing
  const [hoveredCapturedPiece, setHoveredCapturedPiece] = useState(null); // To track hovered captured piece for meme
  const [memeCounter, setMemeCounter] = useState({}); // To track which meme version to show for each piece
  const [isDarkTheme, setIsDarkTheme] = useState(true); // New state for theme tracking
  const [volume, setVolume] = useState(0.25); // Volume state (0 to 1) - starts at 25%
  const [isMuted, setIsMuted] = useState(false); // Mute state
  const [gameMode, setGameMode] = useState('computer'); // Default to 'computer' mode (Player vs Bot)
  const [computerColor, setComputerColor] = useState('blue'); // Computer plays as blue by default
  const [showTeamSelection, setShowTeamSelection] = useState(true); // Show team selection popup by default
  const [currentMusic, setCurrentMusic] = useState('lofi'); // Add state for current music track
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [gameCode, setGameCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [gameCreator, setGameCreator] = useState(true);

  useEffect(() => {
    console.log('Chessboard mounted, initialGameCode:', initialGameCode);
    if (initialGameCode) {
      console.log('Joining game with code:', initialGameCode);
      setGameMode('online');
      setGameCreator(false); // Receiver joins, not creator
    }
  }, [initialGameCode]);

  // Audio ref for background music
  const audioRef = useRef(null);

  // Initialize the board
  useEffect(() => {
    initializeBoard();
    
    // Initialize audio after component mounts
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    audioRef.current.loop = true;
    
    // Set initial music
    const initialMusic = `${process.env.PUBLIC_URL}/assets/audio/politcal party lofi.mp3`;
    audioRef.current.src = initialMusic;
    
    // Try to play (will be blocked by browser autoplay policy)
    const tryPlay = () => {
      if (audioRef.current && !isMuted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Autoplay prevented:', error);
          });
        }
      }
    };
    
    // Try to play after a short delay to handle autoplay policies
    const playTimeout = setTimeout(tryPlay, 1000);
    
    // Cleanup
    return () => {
      clearTimeout(playTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (initialGameCode) {
      console.log('Joining game with code:', initialGameCode);
      // Future: Add logic to load game state based on game code
    }
  }, [initialGameCode]);

  const initializeBoard = () => {
    // Create an empty 8x8 board
    const newBoard = Array(8).fill().map(() => Array(8).fill(null));

    // Setup red pieces (black in standard chess)
    // Back row
    newBoard[0][0] = { type: 'r', color: 'red', name: 'Vivek Ramaswamy' };
    newBoard[0][1] = { type: 'n', color: 'red', name: 'Elon Musk' };
    newBoard[0][2] = { type: 'b', color: 'red', name: 'JD Vance' }; // Updated from Rand Paul
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
    setCapturingPiece(null);
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

    switch (piece.type) {
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
    setCapturedPieces({ red: [], blue: [] });
    setTurn('red'); // Always start with red
    setWinner(null);
    setGameStatus('active');
    setCapturedPiecePopup(null);
    setMemeCounter({});
    setCapturingPiece(null); // Reset capturing piece

    // If computer plays as red, trigger its move after a short delay
    if (gameMode === 'computer' && computerColor === 'red' && !showTeamSelection) {
      setTimeout(() => {
        makeComputerMove();
      }, 1000);
    }
  };

  // Start a completely new game (reset game and show team selection)
  const newGame = () => {
    setShowTeamSelection(true); // Show team selection popup
    setGameMode('computer'); // Default to Player vs Bot mode
    initializeBoard();
    setSelectedPiece(null);
    setLegalMoves([]);
    setCapturedPieces({ red: [], blue: [] });
    setTurn('red');
    setWinner(null);
    setGameStatus('active');
    setCapturedPiecePopup(null);
    setMemeCounter({});
    setCapturingPiece(null); // Reset capturing piece
  };

  // Handle square click
  const handleSquareClick = (row, col) => {
    // Play audio on first user interaction (if not already playing)
    ensureAudioPlaying();

    // Don't allow moves if game is over
    if (gameStatus !== 'active') return;

    // If the capture popup is showing, clicking anywhere should dismiss it
    if (capturedPiecePopup) {
      // Cycle to next meme for this piece before dismissing
      if (capturedPiecePopup && capturedPiecePopup.name) {
        cycleToNextMeme(capturedPiecePopup.name);
      }

      // Dismiss popup and switch turns
      const dismissPopup = () => {
        setCapturedPiecePopup(null);
        setCapturingPiece(null);
        setTurn(turn === 'red' ? 'blue' : 'red');
        document.removeEventListener('click', dismissPopup);
        document.removeEventListener('touchstart', dismissPopup);
        document.removeEventListener('keydown', dismissPopup);
      };
      dismissPopup();
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

        // Save the capturing piece before we move it
        const capturingPiece = newBoard[selectedRow][selectedCol];

        // Move piece
        newBoard[row][col] = newBoard[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = null;

        // Update board
        setBoard(newBoard);

        // If a piece is captured, add it to captured pieces and show popup
        if (capturedPiece) {
          // Update captured pieces with the structure { red: [], blue: [] }
          const newCapturedPieces = { ...capturedPieces };
          newCapturedPieces[turn].push(capturedPiece);
          setCapturedPieces(newCapturedPieces);

          // Check if a king was captured (victory condition)
          if (capturedPiece.type === 'k') {
            setWinner(capturingPiece.color);
            setGameStatus('checkmate');
            return; // Don't switch turns if game is over
          }

          // Initialize meme counter if not exists
          if (!memeCounter[capturedPiece.name]) {
            setMemeCounter(prev => ({
              ...prev,
              [capturedPiece.name]: Math.floor(Math.random() * 3) + 1
            }));
          }

          // Show captured piece popup - this will handle the turn change after dismissal
          showCapturedPiecePopup(capturedPiece, capturingPiece);
        } else {
          // No capture - switch turns immediately
          const nextTurn = turn === 'red' ? 'blue' : 'red';
          setTurn(nextTurn);
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

  // Play audio on any user interaction
  const ensureAudioPlaying = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(err => console.log("Could not play audio:", err));
    }
  };

  // Show captured piece popup
  const showCapturedPiecePopup = (capturedPiece, capturingPiece) => {
    // Set popup data
    setCapturedPiecePopup({
      ...capturedPiece,
      capturingPiece
    });

    // Set the capturing piece for the popup
    setCapturingPiece(capturingPiece);

    // Add a click listener to dismiss the popup
    const dismissPopup = () => {
      setCapturedPiecePopup(null);
      setCapturingPiece(null);
      // Switch turns after popup is dismissed
      setTurn(turn === 'red' ? 'blue' : 'red');
      document.removeEventListener('click', dismissPopup);
      document.removeEventListener('touchstart', dismissPopup);
      document.removeEventListener('keydown', dismissPopup);
    };

    // Add event listeners for dismissing popup
    setTimeout(() => {
      document.addEventListener('click', dismissPopup);
      document.addEventListener('touchstart', dismissPopup);
      document.addEventListener('keydown', dismissPopup);
    }, 500); // Short delay to prevent immediate dismissal
  };

  // Handle popup click
  const handlePopupClick = (e) => {
    console.log("Popup clicked, dismissing...");

    // Try to play audio on this interaction
    ensureAudioPlaying();

    // Cycle to next meme for this piece before dismissing
    if (capturedPiecePopup && capturedPiecePopup.name) {
      cycleToNextMeme(capturedPiecePopup.name);
    }

    // Dismiss popup and switch turns
    setCapturedPiecePopup(null);
    setCapturingPiece(null);
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
        [piece.name]: Math.floor(Math.random() * 3) + 1
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
      // Set initial volume and state
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
      audioRef.current.muted = isMuted;
      audioRef.current.preload = "auto";

      // Set initial music to Lofi
      audioRef.current.src = `${process.env.PUBLIC_URL}/assets/audio/politcal party lofi.mp3`;
      audioRef.current.load();
    }

    // Clean up when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Start music after team is selected
  useEffect(() => {
    if (!showTeamSelection && audioRef.current) {
      const playAudio = () => {
        audioRef.current.play()
          .then(() => console.log("Music started after team selection"))
          .catch(error => {
            console.log("Autoplay prevented - waiting for user interaction");
            
            const startAudio = () => {
              if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play()
                  .then(() => {
                    console.log("Music started after user interaction");
                    // Remove event listeners after successful play
                    document.removeEventListener('click', startAudio);
                    document.removeEventListener('touchstart', startAudio);
                  })
                  .catch(e => console.error("Couldn't play audio:", e));
              }
            };

            // Add listeners to document
            document.addEventListener('click', startAudio, { once: true });
            document.addEventListener('touchstart', startAudio, { once: true });
          });
      };

      playAudio();
    }
  }, [showTeamSelection]);

  // Change music track
  const changeMusic = (musicType) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
    }
    
    // Set the new music file
    const musicFile = musicType === 'lofi' 
      ? 'politcal party lofi.mp3' 
      : 'Degen.mp3';
    
    const newSrc = `${process.env.PUBLIC_URL}/assets/audio/${musicFile}`;
    
    // Only change source if it's different
    if (audioRef.current.src !== newSrc) {
      audioRef.current.pause();
      audioRef.current.src = newSrc;
      setCurrentMusic(musicType);
    }
    
    // Always try to play when changing tracks
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Playback failed:', error);
        // If autoplay was prevented, show a message to the user
        if (error.name === 'NotAllowedError') {
          alert('Please click the play button to start the music.');
        }
      });
    }
  };

  // Update audio volume and mute state when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Toggle mute
  const toggleMute = () => {
    ensureAudioPlaying(); // Try to play audio when user interacts with audio controls

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    ensureAudioPlaying(); // Try to play audio when user interacts with audio controls

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

  // Helper function to get positional value (for advanced AI)
  const getPositionalValue = (row, col) => {
    // Bonus for controlling the center
    const centerBonus = 5 - (Math.abs(row - 3.5) + Math.abs(col - 3.5));

    // Bonus for advancement toward opponent side
    const advancementBonus = computerColor === 'blue'
      ? (7 - row) * 0.1 // Blue wants to advance toward row 0
      : row * 0.1;      // Red wants to advance toward row 7

    return centerBonus + advancementBonus;
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

  // Make a computer move - AI functionality
  const makeComputerMove = () => {
    if (gameMode === 'online') {
      console.log('No bot moves in online mode');
      return;
    }
    // Safety check - only move if it's computer's turn and game is active
    if (gameStatus !== 'active' || turn !== computerColor) {
      console.log("Not computer's turn or game not active");
      return;
    }

    setTimeout(() => {
      // Find all computer pieces
      const computerPieces = [];
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece && piece.color === computerColor) {
            computerPieces.push({ piece, row, col });
          }
        }
      }

      // Shuffle to add some variety to the computer's moves
      computerPieces.sort(() => Math.random() - 0.5);

      let moveFound = false;

      // First, try to find capturing moves
      for (const { piece, row, col } of computerPieces) {
        const moves = getLegalMoves(row, col);
        const capturingMoves = [];

        // Find moves that capture opponent pieces
        for (const [toRow, toCol] of moves) {
          if (board[toRow][toCol] && board[toRow][toCol].color !== computerColor) {
            capturingMoves.push([toRow, toCol]);
          }
        }

        if (capturingMoves.length > 0) {
          // Sort capturing moves based on difficulty level
          capturingMoves.sort(([r1, c1], [r2, c2]) => {
            const value1 = getPieceValue(board[r1][c1].type);
            const value2 = getPieceValue(board[r2][c2].type);
            return (value2 - value1) + (Math.random() * 0.5 - 0.25);
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
            // Different move selection based on difficulty
            const randomIndex = Math.floor(Math.random() * moves.length);
            const [toRow, toCol] = moves[randomIndex];
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

    // Move piece
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    // Update the board
    setBoard(newBoard);

    // If a piece is captured, add it to captured pieces and show popup
    if (targetPiece) {
      // Update captured pieces with the structure { red: [], blue: [] }
      const newCapturedPieces = { ...capturedPieces };
      newCapturedPieces[computerColor].push(targetPiece);
      setCapturedPieces(newCapturedPieces);

      // Check if a king was captured (victory condition)
      if (targetPiece.type === 'k') {
        setWinner(piece.color);
        setGameStatus('checkmate');
        return; // Don't switch turns if game is over
      }

      // Initialize meme counter if not exists
      if (!memeCounter[targetPiece.name]) {
        setMemeCounter(prev => ({
          ...prev,
          [targetPiece.name]: Math.floor(Math.random() * 3) + 1
        }));
      }

      // Show captured piece popup - this will handle the turn change after dismissal
      showCapturedPiecePopup(targetPiece, piece);
    } else {
      // No capture - switch turns immediately
      const nextTurn = computerColor === 'red' ? 'blue' : 'red';
      setTurn(nextTurn);
    }
  };

  // Trigger computer move after human moves
  useEffect(() => {
    // Only make a move if it's computer's turn
    if (gameMode === 'computer' && turn === computerColor && gameStatus === 'active' && !showTeamSelection) {
      // Add a slight delay before computer's move
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, computerColor, gameStatus, showTeamSelection]);

  // Set game mode to computer (removed online mode)
  const setComputerMode = () => {
    if (gameMode !== 'computer') {
      setGameMode('computer');
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

  // Render online play modal
  const renderOnlinePlayModal = () => {
    return null;
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

  // Reference to track if meme counters have been initialized for winner overlay
  const winnerMemeCountersInitialized = useRef(false);

  // Initialize meme counters for winner display when game status changes
  useEffect(() => {
    if (gameStatus !== 'active' && !winnerMemeCountersInitialized.current) {
      // Determine the losing team color
      const losingTeam = winner === 'red' ? 'blue' : 'red';

      // Get all pieces from the losing team
      const losingTeamPieces = [];

      // Add standard pieces from the losing team
      const piecesData = losingTeam === 'red' ? PIECE_MAPPINGS.RED : PIECE_MAPPINGS.BLUE;

      // Collect all losing team pieces
      Object.entries(piecesData).forEach(([pieceType, pieces]) => {
        pieces.forEach(piece => {
          losingTeamPieces.push({
            name: piece.name,
            color: losingTeam,
            type: pieceType
          });
        });
      });

      // Get unique pieces and the king
      const losingKing = losingTeamPieces.find(piece => piece.type === 'k');
      const uniquePieces = Array.from(new Set(losingTeamPieces.map(piece => piece.name)))
        .map(name => losingTeamPieces.find(piece => piece.name === name));

      // Initialize counters for all unique pieces at once
      const newCounters = {};
      uniquePieces.forEach(piece => {
        newCounters[piece.name] = Math.floor(Math.random() * 3) + 1;
      });

      // Initialize counter for king separately if needed
      if (losingKing) {
        newCounters[losingKing.name] = Math.floor(Math.random() * 3) + 1;
      }

      setMemeCounter(prev => ({
        ...prev,
        ...newCounters
      }));

      winnerMemeCountersInitialized.current = true;
    }

    // Reset the initialized flag when game is reset
    if (gameStatus === 'active') {
      winnerMemeCountersInitialized.current = false;
    }
  }, [gameStatus, winner]);

  // Render winner overlay
  const renderWinnerOverlay = () => {
    if (gameStatus === 'active') return null;

    // Map color to party name
    const partyName = winner === 'red' ? 'Republicans' : 'Democrats';

    // Determine the losing team color
    const losingTeam = winner === 'red' ? 'blue' : 'red';

    // Get all pieces from the losing team's side
    // We want to show meme images of the losing team's characters
    const losingTeamPieces = [];

    // Add all the standard pieces from the losing team
    const piecesData = losingTeam === 'red' ? PIECE_MAPPINGS.RED : PIECE_MAPPINGS.BLUE;

    // Loop through each piece type (p, r, n, b, q, k)
    Object.entries(piecesData).forEach(([pieceType, pieces]) => {
      // Loop through each piece of this type
      pieces.forEach(piece => {
        losingTeamPieces.push({
          name: piece.name,
          color: losingTeam,
          type: pieceType
        });
      });
    });

    // Find the king piece (type 'k') in the losing team
    const losingKing = losingTeamPieces.find(piece => piece.type === 'k');

    // Generate falling pieces images
    const fallingPieces = [];

    // Get unique pieces from the losing team (ensure each character appears only once)
    const uniquePieces = Array.from(new Set(losingTeamPieces.map(piece => piece.name)))
      .map(name => losingTeamPieces.find(piece => piece.name === name));

    // Shuffle the unique pieces array to randomize the order
    const shuffledPieces = [...uniquePieces].sort(() => Math.random() - 0.5);

    // Use all unique pieces for falling images (or up to 15 if there are more)
    const piecesToUse = shuffledPieces.slice(0, Math.min(15, shuffledPieces.length));

    // Create a falling piece for each unique piece
    piecesToUse.forEach((piece, i) => {
      // Generate random position and animation properties
      const leftPos = Math.random() * 90 + 5; // 5% to 95% of the screen width
      const delay = Math.random() * 10; // 0 to 10s delay
      const duration = Math.random() * 10 + 10; // 10s to 20s duration
      const size = Math.random() * 48 + 72; // 72px to 120px (20% larger than before)
      const startRotation = Math.random() * 60 - 30; // -30 to +30 degrees initial rotation
      const rotationDirection = Math.random() > 0.5 ? '360deg' : '-360deg'; // Random rotation direction

      fallingPieces.push(
        <div
          key={`falling-${i}`}
          className="falling-piece"
          style={{
            left: `${leftPos}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            width: `${size}px`,
            height: `${size}px`,
            transform: `rotate(${startRotation}deg)`,
            '--end-rotation': rotationDirection // CSS variable for rotation direction
          }}
        >
          <img
            src={getMemeImagePath(piece)}
            alt={piece.name}
          />
        </div>
      );
    });

    return (
      <div className="winner-overlay">
        {fallingPieces}
        <div className="winner-content">
          <img
            src={`${process.env.PUBLIC_URL}/assets/winner/golden_chainsaw.jpg`}
            alt="Golden Chainsaw Trophy"
            className="winner-trophy"
          />
          {losingKing && (
            <img
              src={getMemeImagePath(losingKing)}
              alt={losingKing.name}
              className="winner-king-meme"
            />
          )}
          <h2>{partyName} WIN!</h2>
          <button onClick={resetGame} className="restart-button">Restart Game</button>
        </div>
      </div>
    );
  };

  // Render captured piece popup
  const renderCapturedPiecePopup = () => {
    if (!capturedPiecePopup || !capturingPiece) return null;

    console.log("Rendering popup for:", capturedPiecePopup.name);

    return (
      <div className="captured-popup-overlay" onClick={handlePopupClick}>
        <div className="captured-popup-content" onClick={handlePopupClick}>
          <div className="captured-popup-header">
            <h2>CAPTURED!</h2>
          </div>

          <div className="captured-popup-images">
            <div className={`capturing-piece ${capturingPiece.color}-color`}>
              <img
                src={getPlayerImagePath(capturingPiece)}
                alt={`${capturingPiece.name}`}
                className="capturing-piece-image"
              />
              <div className="piece-label">{capturingPiece.name}</div>
            </div>

            <div className="captured-vs">vs</div>

            <div className={`captured-piece ${capturedPiecePopup.color}-color`}>
              <img
                src={getMemeImagePath(capturedPiecePopup)}
                alt={`${capturedPiecePopup.name}`}
                className="captured-popup-image"
              />
              <div className="piece-label">{capturedPiecePopup.name}</div>
            </div>
          </div>

          <div className="captured-popup-instruction">
            Click anywhere to continue
          </div>
        </div>
      </div>
    );
  };

  // Render the team selection popup at the beginning of the game
  const renderTeamSelectionPopup = () => {
    if (!showTeamSelection) return null;

    return (
      <div className="team-selection-popup">
        <div className="team-selection-content">
          <h2>Choose Your Team</h2>
          <div className="team-options">
            <button
              className="team-button republican-button"
              onClick={() => {
                setComputerColor('blue'); // Player plays as red (Republicans)
                setShowTeamSelection(false);
                setTurn('red');
                resetGame();
              }}
            >
              <div className="team-icon">🐘</div>
              <div className="team-name">Republicans</div>
              <div className="team-color">(Red)</div>
              <img
                src={`${process.env.PUBLIC_URL}/assets/players/red/trump.jpg`}
                alt="Trump"
                className="team-king-image"
              />
            </button>

            <div className="team-vs">VS</div>

            <button
              className="team-button democrat-button"
              onClick={() => {
                setComputerColor('red'); // Player plays as blue (Democrats)
                setShowTeamSelection(false);
                setTurn('blue');
                resetGame();
              }}
            >
              <div className="team-icon">🐴</div>
              <div className="team-name">Democrats</div>
              <div className="team-color">(Blue)</div>
              <img
                src={`${process.env.PUBLIC_URL}/assets/players/blue/obama.jpg`}
                alt="Obama"
                className="team-king-image"
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Function to copy address to clipboard
  const copyToClipboard = (address) => {
    navigator.clipboard.writeText(address).then(() => {
      alert('Address copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Render donation section
  const DonationSection = () => {
    const btcAddress = 'bc1qmm5dv9sk8ddy53frkmf3nkkk7tyj6c72jraqc7';
    const ethAddress = '0x3880dF4eF0096a96751D06cEA97c79855014F16A';
    const venmoLink = 'https://account.venmo.com/u/Baloo_X';
    const dogeAddress = 'D9ytJWFzzvx85gvauZjqMBYRhmfuSxdKAc';

    return (
      <div className="donation-section">
        <h4>Donate & Help Support</h4>
        <p className="donation-message">
          Your tips/donations are extremely appreciated for a poor dev! <b className="white-follow-text">Give me a Follow</b> instead if you can't donate! I still Love ya! More to come!
        </p>
        <div className="crypto-donation">
          <div className="crypto-item">
            <span className="crypto-symbol">BTC</span>
            <span className="crypto-address">{btcAddress}</span>
            <button
              className="copy-address-btn"
              onClick={() => copyToClipboard(btcAddress)}
            >
              COPY
            </button>
          </div>
          <div className="crypto-item">
            <span className="crypto-symbol">ETH</span>
            <span className="crypto-address">{ethAddress}</span>
            <button
              className="copy-address-btn"
              onClick={() => copyToClipboard(ethAddress)}
            >
              COPY
            </button>
          </div>
          <div className="crypto-item">
            <span className="crypto-symbol">DOGE</span>
            <span className="crypto-address">{dogeAddress}</span>
            <button
              className="copy-address-btn"
              onClick={() => copyToClipboard(dogeAddress)}
            >
              COPY
            </button>
          </div>
          <div className="venmo-item">
            <a
              href={venmoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="coffee-image-link"
            >
              <div className="coffee-image-container">
                <img 
                  src={`${process.env.PUBLIC_URL}/assets/winner/coffee.jpg`} 
                  alt="Buy me a coffee" 
                  className="coffee-image"
                />
              </div>
            </a>
            <a
              href={venmoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="venmo-link"
            >
              Venmo: @Baloo_X
            </a>
          </div>
          <div className="follow-item">
            <a
<<<<<<< HEAD
              href="https://x.com/Baloo__x"
=======
              href="https://x.com/Baloo__X"
>>>>>>> eeefd64fd5e3688e0788f6ea5e6dbeeffdcb7078
              target="_blank"
              rel="noopener noreferrer"
              className="venmo-link"
            >
              <span>Follow Me</span>
              <img
                src={`${process.env.PUBLIC_URL}/assets/memes/x/baloo.X.jpg`}
                alt="X Logo"
                className="x-follow-logo"
              />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="game-container">
      {/* Background audio player */}
      <audio
        ref={audioRef}
        src={`${process.env.NODE_ENV === 'production'
          ? `${process.env.PUBLIC_URL}/assets/audio/${currentMusic === 'lofi' ? 'politcal party lofi.mp3' : 'Degen.mp3'}`
          : `/assets/audio/${currentMusic === 'lofi' ? 'politcal party lofi.mp3' : 'Degen.mp3'}`}`}
        loop
        autoPlay
        preload="auto"
        muted={isMuted}
      />

      <div className="chessboard">
        {board.length > 0 ? renderBoard() : <div>Loading...</div>}
        {renderWinnerOverlay()}
        {renderCapturedPiecePopup()}
        {renderTeamSelectionPopup()}
      </div>
      <div className="captured-pieces">
        <h3>Captured Pieces</h3>
        <div className="captured-red">
          <h4>Republicans Captures</h4>
          {renderCapturedPieces('red')}
        </div>
        <div className="captured-blue">
          <h4>Democrats Captures</h4>
          {renderCapturedPieces('blue')}
        </div>
        <div className="turn-info">
          <h3>Current Turn: <span className={`team-name ${turn}`}>{turn === 'red' ? 'Republicans' : 'Democrats'}</span></h3>
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
          <span className="music-text">Music {isMuted ? 'Off' : 'On'}</span>
          <div className="music-options">
            <button
              className={`music-choice ${currentMusic === 'lofi' ? 'active' : ''}`}
              onClick={() => changeMusic('lofi')}
            >
              Lofi
            </button>
            <button
              className={`music-choice ${currentMusic === 'degen' ? 'active' : ''}`}
              onClick={() => changeMusic('degen')}
            >
              Degen
            </button>
          </div>
          <div className="follow-support">
            <span className="follow-text">Follow Me</span>
          </div>
          <a
            href="https://x.com/Baloo__X"
            target="_blank"
            rel="noopener noreferrer"
            className="x-button"
            aria-label="Follow on X (Twitter)"
          >
            𝕏
          </a>
        </div>

        {/* Game mode controls */}
        <div className="game-mode-controls">
          <div className="mode-toggle">
            <span className="mode-label">Game Mode:</span>
            <button
              className="mode-button active"
              onClick={setComputerMode}
            >
              🤖 Player vs Bot
            </button>
          </div>

          {/* Only show computer color toggle in computer mode */}
          {gameMode === 'computer' && (
            <div className="computer-color-toggle">
              <span className="mode-label">You Play As:</span>
              <button
                className={`color-button ${computerColor === 'red' ? 'blue-button' : 'red-button'}`}
                onClick={toggleComputerColor}
                disabled={gameStatus === 'active'}
              >
                {computerColor === 'red' ? 'Democrats' : 'Republicans'}
              </button>
            </div>
          )}
        </div>
        <DonationSection />
        <div className="satire-warning">
          Warning: This game is a lighthearted satire poking fun at politicians. It's all in good fun—don't take it too seriously!
        </div>
      </div>
      {renderOnlinePlayModal()}
    </div>
  );
};

export default Chessboard;
