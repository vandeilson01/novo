function Navigation({ categories, onCategoryClick, selectedCategory }) {
  return (
    <nav className="flex gap-4 pb-8 overflow-x-auto scrollbar-hide">
      <button
        className={`flex items-center border-0 buts gap-3 bg-[#d69d46] text-white font-bold py-4 px-6 rounded-full shadow hover:bg-yellow-600 transition ${
          !selectedCategory ? ' ' : ''
        }`}
        onClick={() => onCategoryClick(null)}
      >
        <svg className="w-8 h-8 stroke-current" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 12L12 3l9 9v9a3 3 0 01-3 3H6a3 3 0 01-3-3v-9z" />
        </svg>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`bg-[#d69d46] buts text-white font-bold py-4 px-6 rounded-full shadow hover:bg-yellow-600 transition whitespace-nowrap ${
            selectedCategory === category.id ? ' ' : ''
          }`}
          onClick={() => onCategoryClick(category.id)}
        >
          {category.name}
        </button>
      ))}
    </nav>
  );
}

export default Navigation;