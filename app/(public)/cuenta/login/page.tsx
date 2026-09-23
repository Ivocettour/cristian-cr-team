import { LoginForm } from "./LoginForm";

export const metadata = { title: "Ingresar — CR&LB team" };

export default function CuentaLoginPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <h1 className="mb-8 font-heading text-3xl text-white">
        INGRESAR <span className="text-accent">·</span> CR&amp;LB TEAM
      </h1>
      <LoginForm />
    </div>
  );
}
