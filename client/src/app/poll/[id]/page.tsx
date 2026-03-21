"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import "./style.css";

interface Poll {
  id: string;
  name_poll: string;
  question_text: string;
  options: Array<{ id: number; text: string; votes: number }>;
  is_public: boolean;
  user_id: number;
}

export default function SurveyPage() {
  const params = useParams();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Подключение к WebSocket
  useEffect(() => {
    if (!params.id) return;

    const connectWebSocket = () => {
      try {
        // Закрываем предыдущее соединение если есть
        if (wsRef.current) {
          wsRef.current.close();
        }

        // Подключаемся к WebSocket серверу
        const ws = new WebSocket("ws://localhost:6700");
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket подключен");
          setIsConnected(true);

          // Подписываемся на обновления опроса
          ws.send(
            JSON.stringify({
              type: "subscribe",
              pollId: parseInt(params.id as string),
            }),
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("WebSocket сообщение:", data);

            if (
              data.type === "votes_update" &&
              data.pollId === parseInt(params.id as string)
            ) {
              // Обновляем голоса в реальном времени
              setPoll((prev) => {
                if (!prev) return prev;

                return {
                  ...prev,
                  options: prev.options.map((option) => {
                    const updatedVote = data.votes.find(
                      (v: any) => v.id === option.id,
                    );
                    return updatedVote
                      ? { ...option, votes: updatedVote.votes }
                      : option;
                  }),
                };
              });

              toast.info("Результаты обновлены в реальном времени!", {
                autoClose: 2000,
                hideProgressBar: true,
              });
            }

            if (data.type === "welcome") {
              console.log("WebSocket: ", data.message);
            }

            if (data.type === "subscribed") {
              console.log("Подписались на опрос:", data.pollId);
            }
          } catch (error) {
            console.error("Ошибка обработки WebSocket сообщения:", error);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket отключен");
          setIsConnected(false);

          // Пытаемся переподключиться через 3 секунды
          setTimeout(() => {
            if (params.id) {
              connectWebSocket();
            }
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error("WebSocket ошибка:", error);
        };

        return () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (error) {
        console.error("Ошибка подключения WebSocket:", error);
      }
    };

    connectWebSocket();

    // Очистка при размонтировании
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [params.id]);

  // Загрузка данных опроса
  useEffect(() => {
    if (params.id) {
      console.log("Загружаем опрос с ID:", params.id);
      fetchPoll();
    }
  }, [params.id]);

  const fetchPoll = async () => {
    try {
      const response = await fetch(
        `http://localhost:6700/api/polls/${params.id}`,
      );
      console.log("Статус ответа:", response.status);

      if (response.ok) {
        const data = await response.json();

        const transformedData: Poll = {
          id: data.id?.toString() || params.id?.toString() || "",
          name_poll: data.name_poll || data.title || "Без названия",
          question_text: data.question_text || data.description || "",
          options: data.options || data.answers || [],
          is_public: data.is_public !== false,
          user_id: data.user_id || data.author_id || 1,
        };

        console.log("Преобразованные данные:", transformedData);
        setPoll(transformedData);
      } else {
        const errorText = await response.text();
        console.error("Ошибка ответа:", errorText);
        toast.error("Опрос не найден");
      }
    } catch (error) {
      console.error("Ошибка загрузки опроса:", error);
      toast.error("Ошибка загрузки опроса");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Для голосования нужно войти в систему");
        return;
      }

      console.log("Голосование за optionId:", optionId);

      const response = await fetch(
        `http://localhost:6700/api/polls/${params.id}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ optionId }),
        },
      );

      const data = await response.json();
      console.log("Ответ на голосование:", data);

      if (response.ok) {
        toast.success("Голос принят!");
      } else {
        toast.error(data.error || "Ошибка голосования");
      }
    } catch (error) {
      console.error("Ошибка при отправке голоса:", error);
      toast.error("Ошибка при отправке голоса");
    }
  };

  if (loading) {
    return (
      <div className="survey-container">
        <div className="survey-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Загрузка опроса ID: {params.id}...</p>
          <div
            className={`ws-status ${
              isConnected ? "connected" : "disconnected"
            }`}
          >
            WebSocket: {isConnected ? "Подключен" : "Отключен"}
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="survey-container">
        <div className="survey-not-found">
          <h1 className="not-found-title">Опрос не найден</h1>
          <p className="not-found-text">ID: {params.id}</p>
          <Link href="/" className="not-found-link">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  const totalVotes =
    poll.options?.reduce((sum, option) => sum + (option.votes || 0), 0) || 0;

  return (
    <div className="survey-container">
      {/* Статус WebSocket */}
      <div
        className={`ws-connection ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        <div className="ws-indicator"></div>
        <span className="ws-text">
          {isConnected ? "Обновления в реальном времени" : "Нет соединения"}
        </span>
      </div>

      <div className="survey-header">
        <h1 className="survey-title">{poll.name_poll}</h1>
        {poll.question_text && (
          <p className="survey-description">{poll.question_text}</p>
        )}
        <div className="survey-meta">
          <span className="meta-total">Всего голосов: {totalVotes}</span>
          <span
            className={`meta-status ${poll.is_public ? "public" : "private"}`}
          >
            {poll.is_public ? "Публичный" : "Приватный"}
          </span>
          <span className="meta-realtime">⚡ Real-time</span>
        </div>
      </div>

      <div className="survey-options">
        {poll.options?.map((option, index) => {
          const percentage =
            totalVotes > 0
              ? Math.round(((option.votes || 0) / totalVotes) * 100)
              : 0;

          return (
            <div key={option.id || index} className="option-card">
              <div className="option-header">
                <span className="option-text">
                  {option.text || `Вариант ${index + 1}`}
                </span>
                <span className="option-votes">
                  {option.votes || 0} голосов
                </span>
              </div>

              <div className="option-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${percentage}%` }}
                ></div>
                <span className="progress-percent">{percentage}%</span>
              </div>

              <button
                onClick={() => handleVote(option.id || index + 1)}
                className="vote-button"
              >
                <span className="vote-icon">✓</span>
                Голосовать
              </button>
            </div>
          );
        })}
      </div>

      <div className="survey-footer">
        <div className="footer-info">
          <p className="info-text">
            ⚡ Голоса обновляются в реальном времени через WebSocket
          </p>
          <p className="info-text">
            Каждый пользователь может проголосовать только один раз
          </p>
          <p className="info-id">ID опроса: {params.id}</p>
        </div>
        <button onClick={fetchPoll} className="refresh-button">
          Обновить вручную
        </button>
        <Link href="/" className="not-found-link">
          Вернуться на главную
        </Link>
      </div>
      <ToastContainer />
    </div>
  );
}
