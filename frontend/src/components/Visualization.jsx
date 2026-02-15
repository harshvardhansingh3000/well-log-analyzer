import { useState, useEffect } from 'react';
import Plotly from 'react-plotly.js';
import ReactMarkdown from 'react-markdown';
import { getCurves, getWellData, interpretData } from '../services/api';

const Plot = Plotly.default || Plotly;

function Visualization({ well }) {
  const [curves, setCurves] = useState([]);
  const [selectedCurves, setSelectedCurves] = useState([]);
  const [startDepth, setStartDepth] = useState(well.start_depth);
  const [endDepth, setEndDepth] = useState(well.start_depth + 100);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchCurves();
  }, []);

  const fetchCurves = async () => {
    try {
      const result = await getCurves(well.id);
      setCurves(result.curves);
      // Default select first few curves
      setSelectedCurves([result.curves[2], result.curves[12]]); // HC1, TOTAL_GAS
    } catch (err) {
      setError('Failed to load curves');
    }
  };

  const fetchData = async () => {
    if (selectedCurves.length === 0) {
      setError('Please select at least one curve');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await getWellData(well.id, startDepth, endDepth, selectedCurves);
      setData(result);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCurveToggle = (curve) => {
    setSelectedCurves(prev => 
      prev.includes(curve)
        ? prev.filter(c => c !== curve)
        : [...prev, curve]
    );
  };

  const preparePlotData = () => {
    if (!data || data.length === 0) return [];

    return selectedCurves.map((curve, index) => {
      const depths = data.map(row => row.depth);
      const values = data.map(row => row.data[curve]);

      return {
        x: values,
        y: depths,
        type: 'scatter',
        mode: 'lines',
        name: curve,
        xaxis: `x${index + 1}`,
        yaxis: index === 0 ? 'y' : `y${index + 1}`,
        line: { width: 2 }
      };
    });
  };

  const prepareLayout = () => {
    const numCurves = selectedCurves.length;
    if (numCurves === 0) return {};

    // Calculate width for each subplot
    const subplotWidth = 1 / numCurves;

    const layout = {
      height: 700,
      showlegend: true,
      hovermode: 'closest',
    };

    // Configure axes for each curve
    selectedCurves.forEach((curve, index) => {
      const xAxisKey = index === 0 ? 'xaxis' : `xaxis${index + 1}`;
      const yAxisKey = index === 0 ? 'yaxis' : `yaxis${index + 1}`;

      layout[xAxisKey] = {
        title: curve,
        domain: [index * subplotWidth, (index + 1) * subplotWidth - 0.02],
        anchor: index === 0 ? 'y' : `y${index + 1}`,
      };

      layout[yAxisKey] = {
        title: index === 0 ? 'Depth (ft)' : '',
        autorange: 'reversed',
        domain: [0, 1],
        anchor: index === 0 ? 'x' : `x${index + 1}`,
      };
    });

    return layout;
  };

  const handleAnalyze = async () => {
    if (selectedCurves.length === 0 || data.length === 0) {
      setError('Please visualize data first before analyzing');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const result = await interpretData(well.id, startDepth, endDepth, selectedCurves);
      setInterpretation(result.interpretation);
    } catch (err) {
      setError('Failed to analyze data');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Wells
        </button>
        <h1 className="text-3xl font-bold mt-2">{well.name}</h1>
        <p className="text-gray-600">Location: {well.location}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>

          {/* Depth Range */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Depth (ft)
            </label>
            <input
              type="number"
              value={startDepth}
              onChange={(e) => setStartDepth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Depth (ft)
            </label>
            <input
              type="number"
              value={endDepth}
              onChange={(e) => setEndDepth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Curve Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Curves
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
              {curves.map(curve => (
                <label key={curve} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCurves.includes(curve)}
                    onChange={() => handleCurveToggle(curve)}
                    className="mr-2"
                  />
                  <span className="text-sm">{curve}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading || selectedCurves.length === 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
              hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
          >
            {loading ? 'Loading...' : 'Visualize'}
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || data.length === 0}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md
              hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {analyzing ? 'Analyzing...' : '🤖 AI Analysis'}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Visualization</h2>

          {data.length === 0 ? (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Select curves and click Visualize to see the plot
            </div>
          ) : (
            <Plot
              data={preparePlotData()}
              layout={prepareLayout()}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
              }}
              style={{ width: '100%' }}
            />
          )}
        </div>
      </div>

      {/* AI Interpretation Section */}
      {interpretation && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🤖 AI Interpretation</h2>
          <div className="prose max-w-none text-gray-700">
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default Visualization;
