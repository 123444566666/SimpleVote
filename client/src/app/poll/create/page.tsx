import "./style.css";
import PollForm from "@/app/poll/create/components/PollForm";
import ExitButton from "@/components/exitButton/button";
import "@/components/exitButton/button.css";

export default function Page() {
  return (
    <div className="create-survey-page">
      <div className="container">
        <div className="survey-form-container">
          <ExitButton />
          <h1 className="survey-title">Создание опроса</h1>
          <PollForm />
        </div>
      </div>
    </div>
  );
}
