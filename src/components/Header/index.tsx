import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Header = ({ className }: { className: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [isScheduledSearch, setIsScheduledSearch] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!isScheduledSearch && !searchQuery) {
      setError('Please enter a search query.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:5000/search?q=${encodeURIComponent(searchQuery)}`);
      console.log('Search results:', res.data.results);
      alert('Articles saved successfully! Check your Firebase database for saved results.');
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('An error occurred while searching. Please try again later.');
    } finally {
      setLoading(false);
      setIsScheduledSearch(false);
    }
  }, [searchQuery, isScheduledSearch]);

  useEffect(() => {
    const scheduleSearch = async () => {
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(23);
      targetTime.setMinutes(18);
      targetTime.setSeconds(0);

      if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const timeUntilSearch = targetTime.getTime() - now.getTime();
      setScheduledTime(targetTime);

      await new Promise(resolve => 
        setTimeout(async () => {
          setIsScheduledSearch(true);
          setSearchQuery('Ethereum price usd');
          // Wait for state to update
          await new Promise(resolve => setTimeout(resolve, 100));
          handleSearch();
          resolve(true);
        }, timeUntilSearch)
      );
    };

    scheduleSearch();
  }, [handleSearch]);

  return (
    <div className={`flex flex-row justify-between bg-gray-700 items-center px-12 py-4`}>
      <h1 className="text-2xl text-white">AutoWriter</h1>
      <input
        type="text"
        className="border-0 bg-slate-200 w-90 py-2 px-3 rounded-lg outline-none"
        placeholder="Search articles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button
        className={`ml-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {scheduledTime && (
        <p className="text-white text-sm mt-2">
          Next scheduled search: {scheduledTime.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default Header;
