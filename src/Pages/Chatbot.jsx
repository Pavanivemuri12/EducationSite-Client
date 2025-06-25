import { useState, useEffect } from 'react';
import { Send, Bot, User, Copy, Check } from 'lucide-react';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// Azure AI Configuration
const getEnvToken = () => {
  // Create React App
  
  // Vite
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GITHUB_TOKEN) {
    return import.meta.env.VITE_GITHUB_TOKEN;
  }
  
  // Fallback for process.env (if available)
  
  
  return null;
};

const token = getEnvToken();
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-R1-0528";

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [aiClient, setAiClient] = useState(null);

  // Initialize AI Client
  useEffect(() => {
    if (token) {
      try {
        const client = ModelClient(
          endpoint,
          new AzureKeyCredential(token),
        );
        setAiClient(client);
      } catch (error) {
        console.error("Failed to initialize AI client:", error);
      }
    } else {
      console.warn("REACT_APP_GITHUB_TOKEN not found in environment variables");
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!aiClient) {
      const errorMessage = { 
        role: 'error', 
        content: 'AI client not initialized. Please check your API token.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await aiClient.path("/chat/completions").post({
        body: {
          messages: [
            { role: "user", content: currentInput }
          ],
          max_tokens: 2048,
          model: model
        }
      });

      if (isUnexpected(response)) {
        throw new Error(response.body.error?.message || 'Unexpected response from AI service');
      }

      const botResponse = response.body.choices?.[0]?.message?.content || 'No response received.';
      
      const botMessage = { 
        role: 'assistant', 
        content: botResponse, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI query error:", error);
      const errorMessage = { 
        role: 'error', 
        content: `Error: ${error.message}`, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatMessage = (content) => {
    // Split content into parts (text and code blocks)
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/);
    
    return (
      <div className="space-y-3">
        {parts.map((part, index) => {
          // Multi-line code block
          if (part.startsWith('```') && part.endsWith('```')) {
            const codeContent = part.slice(3, -3);
            const lines = codeContent.split('\n');
            const language = lines[0].trim() || 'text';
            const code = lines.slice(1).join('\n');
            
            return (
              <div key={index} className="relative group">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <span className="text-sm text-gray-300 font-medium">{language}</span>
                    <button
                      onClick={() => copyToClipboard(code, `${index}-code`)}
                      className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {copiedCode === `${index}-code` ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm">
                    <code className="text-green-400">{code}</code>
                  </pre>
                </div>
              </div>
            );
          }
          
          // Inline code
          if (part.startsWith('`') && part.endsWith('`')) {
            const code = part.slice(1, -1);
            return (
              <code key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-mono">
                {code}
              </code>
            );
          }
          
          // Regular text with formatting
          return (
            <div key={index} className="space-y-2">
              {part.split('\n').map((line, lineIndex) => {
                if (line.trim() === '') return <br key={lineIndex} />;
                
                // Format different text styles
                let formattedLine = line;
                
                // Bold text
                formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
                
                // Italic text
                formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
                
                // Headers
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={lineIndex} className="text-lg font-semibold text-gray-800 mt-4 mb-2">
                      {line.substring(4)}
                    </h3>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={lineIndex} className="text-xl font-semibold text-gray-800 mt-4 mb-2">
                      {line.substring(3)}
                    </h2>
                  );
                }
                if (line.startsWith('# ')) {
                  return (
                    <h1 key={lineIndex} className="text-2xl font-bold text-gray-800 mt-4 mb-2">
                      {line.substring(2)}
                    </h1>
                  );
                }
                
                // Lists
                if (line.match(/^\d+\.\s/)) {
                  return (
                    <div key={lineIndex} className="flex items-start space-x-2 ml-4">
                      <span className="text-orange-600 font-semibold">{line.match(/^\d+/)[0]}.</span>
                      <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '') }} />
                    </div>
                  );
                }
                
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <div key={lineIndex} className="flex items-start space-x-2 ml-4">
                      <span className="text-orange-600 font-bold">•</span>
                      <span dangerouslySetInnerHTML={{ __html: line.substring(2) }} />
                    </div>
                  );
                }
                
                // Quote blocks
                if (line.startsWith('> ')) {
                  return (
                    <blockquote key={lineIndex} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 italic text-gray-700">
                      {line.substring(2)}
                    </blockquote>
                  );
                }
                
                // Regular paragraph
                return (
                  <p key={lineIndex} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl mb-4 p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <p className="text-gray-500 text-xs">By StudentSphere - Powered by DeepSeek R1</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${aiClient ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-xs text-gray-500">{aiClient ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Messages Area */}
          <div className="h-105 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-orange-50/20 to-yellow-50/20">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <Bot className="w-20 h-20 text-orange-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to AI Assistant</h3>
                <p className="text-lg text-gray-500 mb-2">Start a conversation by typing your message below</p>
                <p className="text-sm text-gray-400">I can help you with coding, questions, explanations, and more!</p>
                {!aiClient && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ⚠️ AI client not initialized. Please check your REACT_APP_GITHUB_TOKEN environment variable.
                  </div>
                )}
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500' 
                      : message.role === 'error'
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-3xl ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block p-4 rounded-2xl shadow-sm max-w-full ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-br-md'
                        : message.role === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                        : 'bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-bl-md text-gray-800'
                    }`}>
                      <div className="text-sm leading-relaxed">
                        {message.role === 'user' ? (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        ) : (
                          formatMessage(message.content)
                        )}
                      </div>
                      <div className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-orange-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-2xl rounded-bl-md p-4 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-2 bg-white border-t border-orange-100">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here... (Press Enter to send)"
                  className="w-full p-2 pr-10 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none bg-gradient-to-r from-orange-50 to-yellow-50 text-sm"
                  rows="1"
                  disabled={loading || !aiClient}
                />
                <div className="absolute right-2 bottom-2 text-xs text-orange-400">
                  {input.length}/1000
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim() || !aiClient}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1 min-w-[80px] justify-center text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;