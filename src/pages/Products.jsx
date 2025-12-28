import { useState, useEffect } from 'react'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  
  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Accessories']

  useEffect(() => {
    fetchProducts()
  }, [filter, search, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filter !== 'All') params.category = filter
      if (search) params.search = search
      if (sortBy !== 'default') params.sort = sortBy

      const data = await getProducts(params)
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>All Products</h1>
      
      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Filters & Sort */}
      <div style={styles.controls}>
        <div style={styles.filters}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                ...styles.filterButton,
                ...(filter === cat ? styles.activeFilter : {})
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.sortSelect}
        >
          <option value="default">Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {/* Results count */}
      <p style={styles.results}>
        {loading ? 'Loading...' : `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`}
      </p>

      {/* Products Grid */}
      {loading ? (
        <div style={styles.loading}>Loading products...</div>
      ) : (
        <div style={styles.grid}>
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No products found</p>
          <button onClick={() => { setSearch(''); setFilter('All') }} style={styles.clearButton}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 80px)'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
    color: '#111827'
  },
  searchContainer: {
    marginBottom: '1.5rem'
  },
  searchInput: {
    width: '100%',
    padding: '1rem 1.5rem',
    fontSize: '1.1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '50px',
    outline: 'none'
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  filters: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '0.65rem 1.25rem',
    border: '2px solid #e5e7eb',
    background: 'white',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  activeFilter: {
    background: '#2563eb',
    color: 'white',
    borderColor: '#2563eb'
  },
  sortSelect: {
    padding: '0.65rem 1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    background: 'white'
  },
  results: {
    color: '#6b7280',
    fontSize: '0.95rem',
    marginBottom: '1.5rem'
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
    color: '#6b7280'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem'
  },
  emptyText: {
    fontSize: '1.5rem',
    color: '#6b7280',
    marginBottom: '1.5rem'
  },
  clearButton: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
}

export default Products
