import { useState, useEffect } from 'react';
import { getWells } from '../services/api';

function WellsList({ onSelectWell, onChatWithWell }) {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWells();
  }, []);

  const fetchWells = async () => {
    try {
      const data = await getWells();
      setWells(data);
    } catch (err) {
      setError('Failed to load wells');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-600">Loading wells...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Wells</h1>

      {wells.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No wells uploaded yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {wells.map((well) => (
            <div
              key={well.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectWell(well)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {well.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Location: {well.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    Depth: {well.start_depth} - {well.stop_depth} ft
                  </p>
                  <p className="text-sm text-gray-600">
                    Uploaded: {new Date(well.upload_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWell(well);
                    }}
                  >
                    Visualize
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatWithWell(well);
                    }}
                  >
                    💬 Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WellsList;
