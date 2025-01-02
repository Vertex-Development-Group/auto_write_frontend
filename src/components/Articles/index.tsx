import React, { useEffect, useState } from 'react';
import './article.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

export interface Article {
    id: string;
    content: string;
    title1: string;
    title2: string;
    title3: string;
    titleCount: number;
    createdAt: number;
    thumbnail: {
      url: string;
      publicId: string;
      prompt: string;
    };
  }


const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/articles');
      console.log('Received articles data:', response.data);
      setArticles(response.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(axios.isAxiosError(err) ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading articles...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="articles-container">
      {articles.map((article) => (
         <Link 
         to={`/articles/${article.id}`} 
         key={article.id}
         className="article-card-link"
       >
        
        <div key={article.id} className="article-card">
          <div className="article-image">
            <img 
              src={article.thumbnail.url} 
              alt={article.title1}
              className="thumbnail"
            />
          </div>
          <div className="article-content">
            <h3>{article.title1}</h3>
            {/* <div className="alternative-titles">
              <small>Alternative titles:</small>
              <p>{article.title2}</p>
              <p>{article.title3}</p>
            </div> */}
            <p className="article-text">{article.content}</p>
            <div className="article-meta">
              <small>Created: {new Date(article.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
        </div>
        </Link>
      ))}
    
    </div>
  );
};

export default Articles;