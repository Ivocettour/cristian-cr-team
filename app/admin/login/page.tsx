import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="mb-8 font-heading text-3xl text-white">
        PANEL ADMIN <span className="text-accent">·</span> CR&LB TEAM
      </h1>
      <LoginForm />
    </div>
  );
}
