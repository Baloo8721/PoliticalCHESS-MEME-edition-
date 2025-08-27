import React from 'react';
import { useParams } from 'react-router-dom';
import Chessboard from './Chessboard';

function PlayGame() {
  const { gameCode } = useParams();
  console.log('PlayGame rendered, gameCode:', gameCode);

  return (
    <div>
      <h2>Game Code: {gameCode}</h2>
      <p>
        You are playing as: {window.location.pathname === '/' 
          ? 'Red (Creator)' 
          : 'Blue (Joiner)'}
      </p>
      <Chessboard initialGameCode={gameCode} />
    </div>
  );
}

export default PlayGame;
