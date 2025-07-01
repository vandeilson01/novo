function PostDetail({ post, onBack }) {
    return (
      <main className="pb-12 mx-auto relative z-10">

        <article
          key={post.id}
          tabIndex="0"
          className="rounded-3xl overflow-hidden shadow-lg transform hover:-translate-y-2 transition mb-8 bg-white relative"
        >
          <img
            src={`http://back.sistemasorder.com/uploads/images/${post.image}`}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 text-white drop-shadow-lg  ">
            <h2 className="text-4xl font-bold">{post.title}</h2>
            <p className="text-base">{post.description}</p>
            
          </div>
        </article>

        <div className="content">
            <p>{post.content}</p>
            {post.englishContent && (
              <p className="english">
                <b>English:</b>
                <br />
                {post.englishContent}
              </p>
            )}
          </div>
      </main>
    );
  }
  
  export default PostDetail;