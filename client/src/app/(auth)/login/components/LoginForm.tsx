"use client";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import ExitButton from "../../../../components/exitButton/button";
import "../../../../components/exitButton/button.css";

interface IFormRegisterProps {
  handleRegistration: (event: React.FormEvent<HTMLFormElement>) => void;
  handleOpenPassword: () => void;
  inputNameRef: React.RefObject<HTMLInputElement | null>;
  inputPasswordRef: React.RefObject<HTMLInputElement | null>;
}

export default function LoginForm({
  handleRegistration,
  handleOpenPassword,
  inputNameRef,
  inputPasswordRef,
}: IFormRegisterProps) {
  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <ExitButton />
          <h1 className="login-title">Логин</h1>
          <form onSubmit={handleRegistration} className="login-form">
            <div className="form-group">
              <input
                ref={inputNameRef}
                type="text"
                placeholder="Имя пользователя или электронная почта"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                ref={inputPasswordRef}
                type="password"
                placeholder="Пароль"
                className="form-input"
              />
              <span onClick={handleOpenPassword} className="password-toggle">
                показать пароль
              </span>
            </div>

            <button type="submit" className="submit-button">
              Войти
            </button>
          </form>

          <div className="links-container">
            <Link href="/registration" className="link">
              Регистрация
            </Link>
            <Link href="/forgot-password" className="link">
              Забыли пароль?
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
