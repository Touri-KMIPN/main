"use client"
import React, { useState, useEffect, useRef } from 'react';
import { TouriChatService } from '@/services/client/TouriChatService';
import type { CallableTool } from '@/types/tool';
import { MarkdownLLM } from './chat/markdown-renderer';
import { Message } from '@/types/chat';

const tools: CallableTool[] = [];

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const serviceRef = useRef<TouriChatService | null>(null);

  // Initialize the service once
  useEffect(() => {
    const service = new TouriChatService(
      () => {}, // onSpotAddition
      (memory) => {
        // memory changed (full history)
        console.log('Memory updated', memory);
      },
      (chunk) => {
        // streaming response chunk
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            // append to existing assistant message
            return [
              ...prev.slice(0, -1),
              { role: 'assistant', text: last.text + chunk },
            ];
          } else {
            // create new assistant message if none exists
            return [...prev, { role: 'assistant', text: chunk }];
          }
        });
      },
      () => {
        // response ended
      },
      () => {
        // response started - clear any existing assistant message and start fresh
        setMessages((prev) => {
          const filtered = prev.filter(msg => !(msg.role === 'assistant' && msg.text === ''));
          return [...filtered, { role: 'assistant', text: '' }];
        });
      },
      tools
    );
    serviceRef.current = service;
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !serviceRef.current) return;

    // add user message
    setMessages((prev) => [...prev, { role: 'user', text }]);
    
    serviceRef.current.sendMessage([{
      text,
    }]);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="messages overflow-auto p-4 h-[80dvh] border rounded">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block px-3 py-2 my-1 rounded-lg max-w-[500px] ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'border'
              }`}
            >
                <MarkdownLLM markdown={msg.text} />
            </div>
          </div>
        ))}
      </div>
      <div className="input-area mt-2 flex">
        <input
          type="text"
          className="flex-grow border rounded-l px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-r"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};
