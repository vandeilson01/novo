function Main({ posts, selectedCategory, onPostClick }) {
  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.categoryId === selectedCategory)
    : posts;

  return (
    <main className="pb-12 mx-auto relative z-10">
      {filteredPosts.map((post) => (
        <article
          key={post.id}
          tabIndex="0"
          className="rounded-3xl overflow-hidden shadow-lg transform hover:-translate-y-2 transition mb-8 bg-white relative"
          onClick={() => onPostClick(post)}
        >
          <img
            src={`http://localhost:3000/uploads/images/${post.image}`}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 text-white drop-shadow-lg  ">
            <h2 className="text-4xl font-bold">{post.title}</h2>
            <p className="text-base">{post.description}</p>
            
          </div>
 
        </article>
      ))}
    </main>
  );
}

export default Main;