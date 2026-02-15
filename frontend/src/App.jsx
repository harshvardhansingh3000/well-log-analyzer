import { useState } from 'react';
import Upload from './components/Upload';
import WellsList from './components/WellsList';
import Visualization from './components/Visualization';
import Chat from './components/Chat';

function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [selectedWell, setSelectedWell] = useState(null);

  const handleUploadSuccess = () => {
    setCurrentView('wells');
  };

  const handleSelectWell = (well) => {
    setSelectedWell(well);
    setCurrentView('visualization');
  };

  const handleChatWithWell = (well) => {
    setSelectedWell(well);
    setCurrentView('chat');
  };

  const handleBackToWells = () => {
    setCurrentView('wells');
    setSelectedWell(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Well Log Analyzer
            </h1>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-4 py-2 rounded-md ${
                  currentView === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setCurrentView('wells')}
                className={`px-4 py-2 rounded-md ${
                  currentView === 'wells' || currentView === 'visualization'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Wells
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {currentView === 'upload' && (
          <Upload onUploadSuccess={handleUploadSuccess} />
        )}
        
        {currentView === 'wells' && (
          <WellsList onSelectWell={handleSelectWell} onChatWithWell={handleChatWithWell} />
        )}
        
        {currentView === 'visualization' && selectedWell && (
          <Visualization well={selectedWell} onBack={handleBackToWells} />
        )}

        {currentView === 'chat' && selectedWell && (
          <Chat well={selectedWell} />
        )}
      </main>
    </div>
  );
}

export default App;
