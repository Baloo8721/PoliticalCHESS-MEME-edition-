import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Chessboard from './components/Chessboard';
import PlayGame from './components/PlayGame';

function NotFound() {
  return (
    <div>
      <h2>404: Page Not Found</h2>
      <p>The route you're trying to access does not exist.</p>
      <Link to="/">Return to Home</Link>
    </div>
  );
}

function App() {
  console.log('App rendered - checking routes');
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Chessboard />} />
          <Route path="/play/:gameCode" element={<PlayGame />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
