import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Article {
  title: string;
  content: string;
}

const Sidebar = ({ className, onFileSelect }: { onFileSelect: any; className: string }) => {
  const [articleBatches, setArticleBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastProcessedBatchId, setLastProcessedBatchId] = useState<string | null>(null);

  const handleFileClick = (fileData: any) => {
    onFileSelect(fileData); // Pass selected file data to parent component
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/batches');
        console.log('Raw API response:', response.data);
        setArticleBatches(response.data.batches); // Extract just the batches array
        setLoading(false);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Error fetching articles');
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    // Only process if there's a new batch and it hasn't been processed yet
    if (articleBatches.length > 0) {
      const latestBatch = articleBatches[0];
      if (latestBatch.id !== lastProcessedBatchId) {
        onFileSelect(latestBatch);
        setLastProcessedBatchId(latestBatch.id);
      }
    }
  }, [articleBatches]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  console.log("Here are files from sidebar:", articleBatches);

  return (
    <div className={`flex flex-col bg-gray-600 w-52 h-screen ${className}`}>
      <h2 className="text-lg font-bold mb-4">Articles</h2>
      <ul className="space-y-2">
      {articleBatches.length > 0 ? (
      articleBatches.map((batch, index) => {
        // Convert the createdAt timestamp to a human-readable format
        const creationDate = new Date(batch.createdAt);
        const formattedDate = creationDate.toLocaleString(); // You can use .toISOString() if you want UTC time

        return (
          <li
            key={index}
            className="p-2 bg-amber-700 rounded hover:bg-gray-500 hover:cursor-pointer"
            onClick={() => handleFileClick(batch)} // Pass the actual file data (articles) to the parent
          >
            <h3 className="font-semibold">{batch.id}</h3>
            <p className="text-sm text-gray-300">{formattedDate}</p> {/* Display the creation time */}
          </li>
        );
      })
    ) : (
      <p>No articles available</p>
    )}
      </ul>
    </div>
  );
};

export default Sidebar;
