"use client";
import "./style.css";
import React, { useRef } from "react";
import LoginForm from "./components/LoginForm";
import { login } from "./actions/login.actions";

export default function Page() {
  const inputNameRef = useRef<HTMLInputElement>(null);
  const inputPasswordRef = useRef<HTMLInputElement>(null);

  async function handleRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const loginValue = inputNameRef.current?.value || "";
    const password = inputPasswordRef.current?.value || "";

    await login(loginValue, password);
  }

  function handleOpenPassword() {
    const passwordInput = inputPasswordRef.current;
    if (passwordInput) {
      passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
    }
  }

  return (
    <LoginForm
      handleRegistration={handleRegistration}
      handleOpenPassword={handleOpenPassword}
      inputNameRef={inputNameRef}
      inputPasswordRef={inputPasswordRef}
    />
  );
}
