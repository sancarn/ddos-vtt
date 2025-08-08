import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameInterface } from './components/GameInterface';
import { DMInterface } from './components/DMInterface';
import { SimplePlayerInterface } from './components/SimplePlayerInterface';
import { useGameStore } from './store/gameStore';
import { peerManager } from './networking/peerManager';
import './styles/App.css';

// Sample data for testing
import { sampleCharacters, sampleMap } from './data/sampleData';

function App() {
  const { 
    setCharacters, 
    setCurrentMap, 
    addCharacter,
    characters 
  } = useGameStore();

  useEffect(() => {
    // Initialize with sample data
    if (characters.length === 0) {
      setCharacters(sampleCharacters);
      setCurrentMap(sampleMap);
    }

    // Initialize networking
    const peerId = peerManager.getPeerId();
    console.log('Peer ID:', peerId);

    return () => {
      peerManager.disconnect();
    };
  }, [setCharacters, setCurrentMap, characters.length]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SimplePlayerInterface />} />
          <Route path="/dm" element={<DMInterface />} />
          <Route path="/player" element={<SimplePlayerInterface />} />
          <Route path="/complex" element={<GameInterface />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
