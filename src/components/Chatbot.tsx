import React, { useState } from "react";
import "../styles/Chatbot.css";
const Chatbot: React.FC = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ type: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    setMessages([...messages, { type: "user", text: query }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch(`https://your-springboot-app.onrender.com/chat?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      setMessages((prev) => [...prev, { type: "bot", text: data.response }]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prev) => [...prev, { type: "bot", text: "Error fetching response." }]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>{msg.text}</div>
        ))}
        {loading && <div className="message bot">Typing...</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about products..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
