import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel({ onLogout, categories }) {
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    content: '',
    image: null,
    categoryId: '',
    englishContent: '',
  });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newVideo, setNewVideo] = useState({ file: null });
  const [editPost, setEditPost] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [editVideo, setEditVideo] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchVideos();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('https://back.sistemasorder.com/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await axios.get('https://back.sistemasorder.com/api/videos');
      setVideos(res.data);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const addPost = async () => {
    if (!newPost.title || !newPost.content || !newPost.image) {
      alert('Title, content, and image are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('description', newPost.description);
      formData.append('content', newPost.content);
      formData.append('image', newPost.image);
      formData.append('categoryId', newPost.categoryId);
      formData.append('englishContent', newPost.englishContent);

      await axios.post('https://back.sistemasorder.com/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchPosts();
      setNewPost({ title: '', description: '', content: '', image: null, categoryId: '', englishContent: '' });
    } catch (err) {
      console.error('Error adding post:', err);
      alert('Failed to add post: ' + err.message);
    }
  };

  const updatePost = async () => {
    if (!editPost.title || !editPost.content) {
      alert('Title and content are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', editPost.title);
      formData.append('description', editPost.description);
      formData.append('content', editPost.content);
      if (editPost.image) formData.append('image', editPost.image);
      formData.append('categoryId', editPost.categoryId);
      formData.append('englishContent', editPost.englishContent);

      await axios.put(`https://back.sistemasorder.com/api/posts/${editPost.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchPosts();
      setEditPost(null);
    } catch (err) {
      console.error('Error updating post:', err);
      alert('Failed to update post: ' + err.message);
    }
  };

  const addCategory = async () => {
    if (!newCategory.name) {
      alert('Category name is required');
      return;
    }
    try {
      await axios.post('https://back.sistemasorder.com/api/categories', newCategory);
      window.location.reload();
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Failed to add category');
    }
  };

  const updateCategory = async () => {
    if (!editCategory.name) {
      alert('Category name is required');
      return;
    }
    try {
      await axios.put(`https://back.sistemasorder.com/api/categories/${editCategory.id}`, { name: editCategory.name });
      window.location.reload();
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Failed to update category');
    }
  };

  const addVideo = async () => {
    if (!newVideo.file) {
      alert('Video file is required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('video', newVideo.file);

      await axios.post('https://back.sistemasorder.com/api/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchVideos();
      setNewVideo({ file: null });
    } catch (err) {
      console.error('Error adding video:', err);
      alert('Failed to add video');
    }
  };

  const updateVideo = async () => {
    if (!editVideo.file) {
      alert('Video file is required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('video', editVideo.file);

      await axios.put(`https://back.sistemasorder.com/api/videos/${editVideo.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchVideos();
      setEditVideo(null);
    } catch (err) {
      console.error('Error updating video:', err);
      alert('Failed to update video');
    }
  };

  const deletePost = async (id) => {
    try {
      await axios.delete(`https://back.sistemasorder.com/api/posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`https://back.sistemasorder.com/api/categories/${id}`);
      window.location.reload();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const deleteVideo = async (id) => {
    try {
      await axios.delete(`https://back.sistemasorder.com/api/videos/${id}`);
      fetchVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <button onClick={onLogout} className="bg-red-500 text-white py-2 px-4 rounded">
          Logout
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">{editCategory ? 'Edit Category' : 'Add Category'}</h3>
        <input
          type="text"
          placeholder="Category Name"
          value={editCategory ? editCategory.name : newCategory.name}
          onChange={(e) =>
            editCategory
              ? setEditCategory({ ...editCategory, name: e.target.value })
              : setNewCategory({ name: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <button
          onClick={editCategory ? updateCategory : addCategory}
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          {editCategory ? 'Update Category' : 'Add Category'}
        </button>
        {editCategory && (
          <button
            onClick={() => setEditCategory(null)}
            className="bg-gray-500 text-white py-2 px-4 rounded ml-2"
          >
            Cancel
          </button>
        )}
        <ul className="mt-4">
          {categories.map((category) => (
            <li key={category.id} className="flex justify-between mb-2">
              <span>{category.name}</span>
              <div>
                <button
                  onClick={() => setEditCategory(category)}
                  className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">{editPost ? 'Edit Post' : 'Add Post'}</h3>
        <input
          type="text"
          placeholder="Title"
          value={editPost ? editPost.title : newPost.title}
          onChange={(e) =>
            editPost
              ? setEditPost({ ...editPost, title: e.target.value })
              : setNewPost({ ...newPost, title: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={editPost ? editPost.description : newPost.description}
          onChange={(e) =>
            editPost
              ? setEditPost({ ...editPost, description: e.target.value })
              : setNewPost({ ...newPost, description: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          placeholder="Content"
          value={editPost ? editPost.content : newPost.content}
          onChange={(e) =>
            editPost
              ? setEditPost({ ...editPost, content: e.target.value })
              : setNewPost({ ...newPost, content: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          placeholder="English Content"
          value={editPost ? editPost.englishContent : newPost.englishContent}
          onChange={(e) =>
            editPost
              ? setEditPost({ ...editPost, englishContent: e.target.value })
              : setNewPost({ ...newPost, englishContent: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <select
          value={editPost ? editPost.categoryId : newPost.categoryId}
          onChange={(e) =>
            editPost
              ? setEditPost({ ...editPost, categoryId: e.target.value })
              : setNewPost({ ...newPost, categoryId: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            editPost
              ? setEditPost({ ...editPost, image: e.target.files[0] })
              : setNewPost({ ...newPost, image: e.target.files[0] })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <button
          onClick={editPost ? updatePost : addPost}
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          {editPost ? 'Update Post' : 'Add Post'}
        </button>
        {editPost && (
          <button
            onClick={() => setEditPost(null)}
            className="bg-gray-500 text-white py-2 px-4 rounded ml-2"
          >
            Cancel
          </button>
        )}
        <ul className="mt-4">
          {posts.map((post) => (
            <li key={post.id} className="flex justify-between mb-2">
              <span>{post.title}</span>
              <div>
                <button
                  onClick={() => setEditPost(post)}
                  className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2">{editVideo ? 'Edit Video' : 'Add Video'}</h3>
        <input
          type="file"
          accept="video/*"
          onChange={(e) =>
            editVideo
              ? setEditVideo({ ...editVideo, file: e.target.files[0] })
              : setNewVideo({ file: e.target.files[0] })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <button
          onClick={editVideo ? updateVideo : addVideo}
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          {editVideo ? 'Update Video' : 'Add Video'}
        </button>
        {editVideo && (
          <button
            onClick={() => setEditVideo(null)}
            className="bg-gray-500 text-white py-2 px-4 rounded ml-2"
          >
            Cancel
          </button>
        )}
        <ul className="mt-4">
          {videos.map((video) => (
            <li key={video.id} className="flex justify-between mb-2">
              <span>{video.filename}</span>
              <div>
                <button
                  onClick={() => setEditVideo(video)}
                  className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteVideo(video.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPanel;