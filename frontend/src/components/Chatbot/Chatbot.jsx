// src/components/Chatbot/Chatbot.jsx

import { Avatar, Button, Input } from "antd";
import { Bot, MessageSquare, Send, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./chatbot.css";

const initialMessage = {
  id: 1,
  text: "Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?",
  sender: "ai",
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  // --- QUAY TRỞ LẠI LOGIC BAN ĐẦU ---
  // Bắt đầu với tin nhắn chào mừng có sẵn
  const [messages, setMessages] = useState([initialMessage]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage = {
      id: Date.now(),
      text: trimmedInput,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "Cảm ơn bạn đã nhắn tin! Tính năng này đang được phát triển và sẽ sớm ra mắt.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="chatbot">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-title">
              <Avatar icon={<Bot />} className="ai-avatar" />
              <div>
                <div className="ai-name">AI Assistant</div>
                <div className="ai-status">Online</div>
              </div>
            </div>
            <Button
              type="text"
              shape="circle"
              icon={<X size={20} />}
              onClick={() => setIsOpen(false)}
            />
          </div>

          <div className="chat-messages">
            {messages.map((msg) => {
              if (msg.sender === "ai") {
                return (
                  <div key={msg.id} className="message ai">
                    <Avatar icon={<Bot />} className="ai-avatar" />
                    <div className="message-bubble">{msg.text}</div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className="message user">
                  <div className="message-bubble">{msg.text}</div>
                  <Avatar icon={<User />} className="user-avatar" />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <Input
              placeholder="Nhập tin nhắn của bạn..."
              size="large"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSendMessage}
            />
            <Button
              className="send-button"
              shape="circle"
              icon={<Send />}
              onClick={handleSendMessage}
            />
          </div>
        </div>
      )}

      <Button
        className="chatbot-trigger"
        shape="circle"
        icon={<MessageSquare size={28} />}
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}