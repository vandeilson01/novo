import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Main from './components/Main';
import PostDetail from './components/PostDetail';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  let inactivityTimeout;

  useEffect(() => {
    fetchCategories();
    fetchPosts();
    fetchVideos();
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      setShowVideos(false);
      inactivityTimeout = setTimeout(() => setShowVideos(true), 3000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(inactivityTimeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  useEffect(() => {
    if (showVideos && videos.length > 0) {
      const videoElement = document.getElementById('video-player');
      if (videoElement) {
        videoElement.onended = () => {
          setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
        };
      }
    }
  }, [showVideos, currentVideoIndex, videos]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://back.sistemasorder.com/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://back.sistemasorder.com/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await axios.get('http://back.sistemasorder.com/api/videos');
      setVideos(res.data);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const res = await axios.post('http://back.sistemasorder.com/api/login', { username, password });
      if (res.data.success) {
        setIsLoggedIn(true);
        setIsAdmin(true);
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedPost(null);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleBack = () => {
    setSelectedPost(null);
    setSelectedCategory(null);
  };

  if (showVideos && videos.length > 0) {
    return (
      <div className="video-overlay">
        <video
          id="video-player"
          src={`http://back.sistemasorder.com/uploads/videos/${videos[currentVideoIndex].filename}`}
          autoPlay
          muted
        />
      </div>
    );
  }

  if (isAdmin && isLoggedIn) {
    return <AdminPanel onLogout={handleLogout} categories={categories} />;
  }

  if (isAdmin && !isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (selectedPost) {
    return (
      <div>
        <Header />
        <Navigation categories={categories} onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory} />
        <PostDetail post={selectedPost} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Navigation categories={categories} onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory} />
      <Main posts={posts} selectedCategory={selectedCategory} onPostClick={handlePostClick} />
      <button
        className="fixed bottom-4 right-4 bg-red-500 text-white py-2 px-4 rounded"
        onClick={() => setIsAdmin(true)}
      >
        Admin Login
      </button>
    </div>
  );
}

export default App;