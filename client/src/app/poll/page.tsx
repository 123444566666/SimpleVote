"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export default function survey() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef<WebSocket | null>(null); // Используем useRef для хранения экземпляра WebSocket

  useEffect(() => {
    // Эта проверка необходима для работы SSR в Next.js
    if (typeof window === "undefined") return;

    // Создаем соединение при монтировании компонента
    const socket = new WebSocket("ws://localhost:8080");
    ws.current = socket;

    socket.onopen = () => {
      console.log("Соединение установлено");
    };

    // Добавляем новое сообщение в состояние при получении
    socket.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    socket.onclose = () => {
      console.log("Соединение закрыто");
    };

    socket.onerror = (error) => {
      console.error("Ошибка WebSocket:", error);
    };

    // Функция очистки, которая будет выполнена при размонтировании компонента
    return () => {
      console.log("Закрытие соединения...");
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(input);
      setInput("");
    }
  };

  return (
    <div>
      <h1>тест</h1>
      <div
        style={{
          height: "200px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Отправить</button>
      <h1>
        <Link href={"/"}>назад</Link>
      </h1>
    </div>
  );
}
