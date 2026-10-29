import { ISurvey } from "@/types/poll";
import { toast } from "react-toastify";

export async function createPoll(
  data: ISurvey
): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Вы не авторизованы. Войдите в систему.");
      return { success: false, error: "No token" };
    }

    console.log("Создание опроса с данными:", data);

    const response = await fetch("http://localhost:6700/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: data.name_poll,
        description: data.question_text,
        options: data.options,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      toast.success("Опрос успешно создан!");
      return { success: true, data: result };
    } else {
      const errorMsg =
        result.error || result.message || "Ошибка при создании опроса";
      toast.error(errorMsg);
      return { success: false, error: result };
    }
  } catch (error: unknown) {
    console.error("Ошибка сети:", error);
    toast.error("Сетевая ошибка");
    return { success: false, error };
  }
}
