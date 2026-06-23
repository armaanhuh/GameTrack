import React, { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';

export default function ApiKeySetup() {
  const { setApiKey } = useLibrary();
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setError('API key cannot be empty');
      return;
    }
    setApiKey(keyInput.trim());
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(15,15,15,0.95)] backdrop-blur-md p-4">
      <div className="w-full max-w-md border border-border bg-surface p-8 text-center">
        <h1 className="text-3xl font-display text-accent mb-4 tracking-wide">
          GameTrack Setup
        </h1>
        
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          Welcome to GameTrack, your personal registry and playtime tracker.
          To query games metadata, search titles, and build your backlog, a free RAWG API key is required.
        </p>

        <div className="mb-6 border-b border-border pb-4 text-xs text-text-secondary">
          No key? Request a free key at{' '}
          <a
            href="https://rawg.io/apidocs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline hover:text-accent-hover transition-colors"
          >
            rawg.io/apidocs
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
              Enter RAWG API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setError('');
              }}
              placeholder="e.g. 5d5a23f7bb..."
              className="w-full border border-border bg-bg text-text text-sm py-2 px-3 focus:outline-none focus:border-accent text-center"
            />
            {error && (
              <p className="text-red-500 text-xs mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-xs uppercase tracking-widest font-semibold py-2.5 transition-all duration-200 btn-micro-bounce"
          >
            Activate Workspace
          </button>
        </form>
      </div>
    </div>
  );
}
