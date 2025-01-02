import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Articles from './components/Articles';
import ArticleDetail from './components/ArticleDetail';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (fileData: React.SetStateAction<null>) => {
    setSelectedFile(fileData);
  };
 
  return (
    <BrowserRouter>
      <div className="App">
        <Header className="Header" />
        <div className="MainContainer">
          <Sidebar className="sidebar" onFileSelect={handleFileSelect} />
          <Routes>
            <Route path="/" element={
              selectedFile && <ChatArea fileData={selectedFile} className="ChatArea" />
            } />
            <Route path="/article" element={<Articles/>} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
