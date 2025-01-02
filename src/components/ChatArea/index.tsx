import axios from 'axios';
import React, { useState, useEffect } from 'react';

const ChatArea = ({ fileData, className }: { fileData: any; className: string }) => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastProcessedFileId, setLastProcessedFileId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!userInput.trim()) return;
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: userInput },
    ]);
    setLoading(true);
  
    try {
      const articles = fileData.articles;
      const batchSize = 1; // Adjust as needed
      const totalBatches = Math.ceil(articles.length / batchSize);
  
      console.log('Starting batch processing:', {
        totalArticles: articles.length,
        totalBatches,
        batchSize,
      });
  
      let summaries = [];
  
      for (let i = 0; i < totalBatches; i++) {
        const batch = articles.slice(i * batchSize, (i + 1) * batchSize);
  
        // Sending each batch individually to the backend
        const response = await fetch('http://localhost:5000/api/generate-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ allBatches: [{ articles: batch }] }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed batch ${i + 1}: ${response.statusText}`);
        }
  
        const data = await response.json();
        summaries.push(data.unifiedSummary);
      }
  
      // Combine all summaries into one final unified summary
      const combinedSummary = summaries.join('\n\n');
      const lines = combinedSummary.split('\n');
      const limitedSummary = lines.slice(0, 16).join('\n');
  
      // Send the final unified summary as assistant's response
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: limitedSummary,
        },
      ]);
    } catch (error: any) {
      console.error('Error in handleSend:', error.message);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: `Error: ${error.message || 'Failed to process the request. Please try again.'}`,
        },
      ]);
    } finally {
      setUserInput('');
      setLoading(false);
    }
  };


  const saveArticle = async () => {
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content) {
      alert('No content available to save.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/save-article', {
        content: lastMessage.content,
      });

      alert(`Article saved successfully! ID: ${response.data.id}`);
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save the article. Please try again.');
    }
  };

  // Only auto-process new files from search
  useEffect(() => {
    if (fileData && fileData.articles && fileData.id !== lastProcessedFileId) {
      setUserInput("Please generate an article about Bitcoin price trends based on these sources.");
      handleSend();
      setLastProcessedFileId(fileData.id);
    }
  }, [fileData]);

  return (
    <div className={`flex flex-col w-full h-full bg-gray-500 p-4 ${className}`}>
      <h2 className="text-lg font-bold mb-4">
        Chat for: <span className="text-blue-400">{fileData?.fileName || 'Unknown File'}</span>
      </h2>

      <div className="flex-1 overflow-y-scroll mb-4 bg-white p-4 rounded-lg max-h-[700px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 mb-2 rounded-md ${
              message.role === 'user' ? 'bg-blue-200 text-right' : 'bg-green-200 text-left'
            }`}
          >
            {message.content}
          </div>
        ))}

<button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={saveArticle}
      >
        Save Article
      </button>

        {loading && (
          <div className="flex justify-center items-center">
            <div className="loader border-t-blue-500 border-4 border-solid rounded-full w-8 h-8 animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your prompt here..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className={`bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
