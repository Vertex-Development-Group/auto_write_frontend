import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './detail.css';

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

const ArticleDetail: React.FC = () => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/articles/${id}`);
      if (!response.ok) {
        throw new Error('Article not found');
      }
      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="article-detail-loading">Loading article...</div>;
  if (error) return <div className="article-detail-error">Error: {error}</div>;
  if (!article) return <div className="article-detail-error">Article not found</div>;

  return (
    <div className="article-detail">
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Back to Articles
      </button>
      
      <div className="article-detail-content">
        <div className="article-detail-header">
          <img 
            src={article.thumbnail.url} 
            alt={article.title1}
            className="article-detail-image"
          />
          <h1>{article.title1}</h1>
        </div>

        <div className="article-detail-meta">
          <div className="alternative-titles">
            <h3>Alternative Titles:</h3>
            <ul>
              <li>{article.title2}</li>
              <li>{article.title3}</li>
            </ul>
          </div>
          <div className="article-date">
            Published on: {new Date(article.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="article-detail-body">
          {article.content.split('\n').map((paragraph, index) => (
            paragraph && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;