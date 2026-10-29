"use client";

export default function FormActions() {

  // function createPoll() {
  //   // Потом надо логику сюда
  //   const newPollId = 1;
  //   const router = useRouter();
  //   router.push(`/survey/${newPollId}`);
  // }

  return (
    <div className="form-actions">
      <button type="submit" className="btn btn-primary">
        Создать опрос
      </button>
      <button type="button" className="btn btn-outline">
        Отмена
      </button>
    </div>
  );
}
