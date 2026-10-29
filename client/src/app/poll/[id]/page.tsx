"use client";

import { useCallback, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PollPage({ params }: { params: any }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  let selectedOptionId: number | null = null;

  const fetchPoll = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:6700/api/polls/${params.id}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка ответа:", errorText);
        toast.error("Опрос не найден");
        return;
      }

      const data = await response.json();
      console.log("Получен опрос:", data);
      setPoll(data);
    } catch (error) {
      console.error("Ошибка загрузки опроса:", error);
      toast.error("Ошибка загрузки опроса");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

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
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ошибка при отправке голоса:", errorText);
        toast.error("Ошибка при отправке голоса");
      } else {
        // Refresh poll data after voting
        fetchPoll();
      }
    } catch (error) {
      console.error("Ошибка при отправке голоса:", error);
      toast.error("Ошибка загрузки опроса");
    } finally {
      router.push("/polls");
    }
  };

  const handlePollVote = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOptionId && !loading) {
      handleVote(selectedOptionId);
    }
  }, [selectedOptionId, loading]);

  useEffect(() => {
    fetchPoll();
  }, []);

  // Show loading screen first
  if (loading) {
    return <div className="h-screen flex items-center justify-center">Загрузка...</div>;
  }

  // Show error state if poll not found
  if (!poll || !poll.options?.length) {
    return <div className="p-8 text-center">Опрос не найден</div>;
  }

  return (
    <SurveyPage>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">{poll.title}</h1>

        <form onSubmit={handlePollVote} className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {poll.options.map((option: any) => (
            <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`poll-${poll.id}`}
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={(e) => (selectedOptionId = Number(e.target.value))}
                className="w-4 h-4 text-blue-600"
              />
              <span>{option.text}</span>
            </label>
          ))}

          <button
            type="submit"
            disabled={!selectedOptionId || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Голосовать
          </button>
        </form>

        {poll.results && poll.options.length > 1 && (
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Результаты</h2>
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {poll.options.map((option: any) => (
                <div key={option.id} className="flex justify-between items-center">
                  <span>{option.text}</span>
                  <span className="font-semibold">{option.results}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SurveyPage>
  );
}

function SurveyPage({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
