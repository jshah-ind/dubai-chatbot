import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Bot, User, Loader, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { chatAPI, ChatResponse } from '../services/api';

const ChatContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px 20px 0 0;
  padding: 1.5rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: none;
`;

const ChatTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const ChatMessages = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  overflow-y: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
`;

const Message = styled.div<{ $isUser: boolean }>`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
  justify-content: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
`;

const MessageAvatar = styled.div<{ $isUser: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$isUser ? 'linear-gradient(135deg, #4299e1, #3182ce)' : 'linear-gradient(135deg, #48bb78, #38a169)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  order: ${props => props.$isUser ? 1 : 0};
`;

const MessageContent = styled.div<{ $isUser: boolean }>`
  max-width: 70%;
  background: ${props => props.$isUser ? 'linear-gradient(135deg, #4299e1, #3182ce)' : '#f7fafc'};
  color: ${props => props.$isUser ? 'white' : '#2d3748'};
  padding: 1rem 1.25rem;
  border-radius: ${props => props.$isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px'};
  line-height: 1.6;
  word-wrap: break-word;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormattedContent = styled.div`
  h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #e53e3e;
    border-bottom: 2px solid #e53e3e;
    padding-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  h4 {
    margin: 1rem 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #c53030;
  }

  p {
    margin: 0.5rem 0;
    line-height: 1.6;
  }

  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0.25rem 0;
  }

  .timeline-item {
    background: rgba(229, 62, 62, 0.1);
    border-left: 3px solid #e53e3e;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-radius: 0 8px 8px 0;
  }

  .timeline-date {
    font-weight: 600;
    color: #e53e3e;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .crime-stat {
    background: rgba(72, 187, 120, 0.1);
    border: 1px solid rgba(72, 187, 120, 0.3);
    padding: 0.5rem;
    border-radius: 6px;
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }

  .highlight {
    background: rgba(255, 235, 59, 0.3);
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-weight: 500;
  }
`;

const ChatInput = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  padding: 1.5rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-top: none;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
`;

const TextArea = styled.textarea`
  flex: 1;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-family: inherit;
  resize: none;
  min-height: 50px;
  max-height: 120px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  background: ${props => props.$disabled ? '#a0aec0' : 'linear-gradient(135deg, #4299e1, #3182ce)'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.$disabled ? '#a0aec0' : 'linear-gradient(135deg, #3182ce, #2c5aa0)'};
    transform: ${props => props.$disabled ? 'none' : 'translateY(-1px)'};
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-style: italic;
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Welcome to Dubai Police Crime Research Assistant:\n\nI can help you with:\n\n• Crime trend analysis and statistics\n• Recent criminal activities and investigations\n• Timeline of significant crime events\n• Geographic crime patterns\n• Seasonal crime variations\n\nWhat would you like to know about crime research in Dubai?',
      isUser: false,
      timestamp: new Date()
    }
  ]);

  // Function to format AI responses with better structure
  const formatAIResponse = (content: string): React.ReactElement => {
    // Remove reference numbers in square brackets like [1], [2][5], etc.
    const cleanedContent = content.replace(/\[\d+\](\[\d+\])*/g, '');

    // Split content into paragraphs
    const paragraphs = cleanedContent.split('\n\n').filter(p => p.trim());

    return (
      <FormattedContent>
        {paragraphs.map((paragraph, index) => {
          const trimmed = paragraph.trim();

          // Check for bullet points
          if (trimmed.includes('•') || trimmed.match(/^\s*[-*]\s/m)) {
            const items = trimmed.split('\n').filter(line => line.trim());
            return (
              <ul key={index}>
                {items.map((item, itemIndex) => {
                  const cleanItem = item.replace(/^[\s•\-*]+/, '').trim();
                  return <li key={itemIndex}>{cleanItem}</li>;
                })}
              </ul>
            );
          }

          // Check for table format (lines with multiple pipe separators)
          if (trimmed.includes('|') && trimmed.split('|').length >= 3) {
            // This looks like a table row, render as preformatted text
            return (
              <div key={index} className="table-row" style={{
                fontFamily: 'monospace',
                fontSize: '0.9em',
                backgroundColor: '#f8f9fa',
                padding: '0.5rem',
                borderRadius: '4px',
                marginBottom: '0.5rem',
                overflowX: 'auto'
              }}>
                {trimmed}
              </div>
            );
          }

          // Check for timeline/date patterns (but exclude table-like content)
          if (trimmed.match(/\b(20\d{2}|January|February|March|April|May|June|July|August|September|October|November|December|Ramadan|Eid)\b/i) && !trimmed.includes('|')) {
            return (
              <div key={index} className="timeline-item">
                <div className="timeline-date">
                  <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Timeline Event
                </div>
                <div>{trimmed}</div>
              </div>
            );
          }

          // Check for statistics or numbers
          if (trimmed.match(/\b\d+\b.*\b(members|cases|arrests|crimes|incidents|reports)\b/i)) {
            return (
              <div key={index} className="crime-stat">
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                {trimmed}
              </div>
            );
          }

          // Check for headings (sentences ending with colon or starting with key phrases)
          if (trimmed.endsWith(':') || trimmed.match(/^(The latest|Recent|Current|Notable|Key|Important|Welcome)/i)) {
            // For numbered headings, remove both the period after the number and the colon
            let headingText = trimmed.replace(':', '');
            if (headingText.match(/^\d+\.\s/)) {
              headingText = headingText.replace(/^(\d+)\.\s/, '$1 ');
            }
            return (
              <h3 key={index}>
                <TrendingUp size={16} />
                {headingText}
              </h3>
            );
          }

          // Regular paragraph with highlighting for important terms
          const highlightedContent = trimmed.replace(
            /\b(Dubai Police|arrest|gang|begging|fraud|crime|investigation|Ramadan|Eid|Crime Research|Assistant)\b/gi,
            '<span class="highlight">$1</span>'
          );

          return (
            <p key={index} dangerouslySetInnerHTML={{ __html: highlightedContent }} />
          );
        })}
      </FormattedContent>
    );
  };
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response: ChatResponse = await chatAPI.sendMessage(userMessage.content);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending the message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>
          <LogoImage src="/dubai-police-logo.svg" alt="Dubai Police Logo" />
          <Bot size={24} />
          Dubai Police AI Crime Research Assistant
        </ChatTitle>
      </ChatHeader>

      <ChatMessages>
        {error && (
          <ErrorMessage>
            <AlertCircle size={20} />
            {error}
          </ErrorMessage>
        )}
        
        {messages.map((message) => (
          <Message key={message.id} $isUser={message.isUser}>
            <MessageAvatar $isUser={message.isUser}>
              {message.isUser ? <User size={20} /> : <Bot size={20} />}
            </MessageAvatar>
            <MessageContent $isUser={message.isUser}>
              {message.isUser ? message.content : formatAIResponse(message.content)}
            </MessageContent>
          </Message>
        ))}
        
        {isLoading && (
          <Message $isUser={false}>
            <MessageAvatar $isUser={false}>
              <Bot size={20} />
            </MessageAvatar>
            <MessageContent $isUser={false}>
              <LoadingMessage>
                <Loader size={16} className="animate-spin" />
                Analyzing your request...
              </LoadingMessage>
            </MessageContent>
          </Message>
        )}
        
        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInput>
        <InputContainer>
          <TextArea
            ref={textAreaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask about crime trends, statistics, or specific incidents..."
            disabled={isLoading}
          />
          <SendButton 
            onClick={handleSendMessage} 
            $disabled={!inputValue.trim() || isLoading}
          >
            <Send size={20} />
          </SendButton>
        </InputContainer>
      </ChatInput>
    </ChatContainer>
  );
};

export default ChatInterface;
