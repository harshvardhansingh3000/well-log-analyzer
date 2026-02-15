import { useState } from 'react';
import { uploadFile } from '../services/api';

function Upload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const result = await uploadFile(file);
      setMessage(`Success! Uploaded ${result.wellName} with ${result.totalRows} rows`);
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (error) {
      setMessage('Error uploading file: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload LAS File</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select LAS File
          </label>
          <input
            type="file"
            accept=".las"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <p className="text-sm text-gray-600 mb-4">
            Selected: {file.name}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
            font-medium"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('Success') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
