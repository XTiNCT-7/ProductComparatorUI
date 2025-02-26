import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import '../styles/ProductComparisonChat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  features: string[];
  pros: string[];
  cons: string[];
}

// This would typically come from your database or API
const sampleProducts: Product[] = [
  {
    id: "phone1",
    name: "SuperPhone X",
    category: "smartphone",
    price: 799,
    features: ["6.7-inch display", "5G", "128GB storage", "Dual camera"],
    pros: ["Excellent camera", "Fast processor", "All-day battery"],
    cons: ["No headphone jack", "Expensive"]
  },
  {
    id: "phone2",
    name: "UltraPhone 12",
    category: "smartphone",
    price: 699,
    features: ["6.4-inch display", "5G", "64GB storage", "Triple camera"],
    pros: ["Great value", "Expandable storage", "Fast charging"],
    cons: ["Average camera quality", "Plastic build"]
  },
  // Add more sample products as needed
];

const ProductComparisonChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I can help you compare products. What types of products are you interested in comparing?' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>(sampleProducts);

  // Function to call Hugging Face Inference API
  const callHuggingFace = async (userMessage: string) => {
    try {
      setIsLoading(true);
      
      // Build context with product information
      const productInfo = availableProducts.map(p => 
        `Product: ${p.name}, Price: $${p.price}, Category: ${p.category}
        Features: ${p.features.join(', ')}
        Pros: ${p.pros.join(', ')}
        Cons: ${p.cons.join(', ')}`
      ).join('\n\n');
      
      // Create a system prompt that guides the model's behavior
      const systemPrompt = `You are a helpful product comparison assistant. Use the following product information to answer user questions:
      
      ${productInfo}
      
      When comparing products:
      1. Focus on relevant features for the user's needs
      2. Highlight price differences and value propositions
      3. Be objective in your analysis
      4. If you don't have information about specific products, say so
      5. Ask follow-up questions to clarify user preferences if needed
      
      Previous conversation:
      ${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}`;
      
      // Construct the full prompt
      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`;
      
      // Call Hugging Face API
      // Using Mistral-7B as an example - you can replace with other models
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        { inputs: fullPrompt },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`
          }
        }
      );
      
      // Extract the generated response - adjust based on actual API response format
      let aiResponse = response.data[0].generated_text;
      
      // Clean up the response to only include what comes after "Assistant:"
      if (aiResponse.includes('Assistant:')) {
        aiResponse = aiResponse.split('Assistant:').pop()?.trim() || aiResponse;
      }
      
      return aiResponse;
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      return "Sorry, I encountered an error processing your request. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Get AI response
    const aiResponse = await callHuggingFace(userMessage);
    
    // Add AI response to chat
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
  };

  // Function to load more products (in a real app, this would fetch from an API)
  const loadProductsByCategory = (category: string) => {
    // This is just a placeholder. In a real app, you would fetch products from your API
    console.log(`Loading products for category: ${category}`);
    // For demonstration, we're just filtering the sample products
    const filtered = sampleProducts.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    setAvailableProducts(filtered.length > 0 ? filtered : sampleProducts);
  };

  // Simple product category detection in user messages
  useEffect(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content.toLowerCase();
    if (lastUserMessage) {
      const categories = ['smartphone', 'laptop', 'headphone', 'camera', 'tv'];
      for (const category of categories) {
        if (lastUserMessage.includes(category)) {
          loadProductsByCategory(category);
          break;
        }
      }
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ))}
        {isLoading && (
          <div className="loading-message">
            Analyzing products...
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products or features to compare..."
          className="message-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ProductComparisonChat;