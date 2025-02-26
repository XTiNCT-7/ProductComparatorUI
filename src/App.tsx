import './App.css'
import ProductComparisonChat from './components/ProductComparisonChat'

function App() {

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Product Comparison Assistant</h1>
        <p className="app-subtitle">Ask me to compare products and get personalized recommendations</p>
      </header>
      <main>
        <ProductComparisonChat />
      </main>
    </div>
  )
}

export default App
