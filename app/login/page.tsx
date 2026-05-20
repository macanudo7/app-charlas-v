import LoginForm from "@/app/ui/login-form";
import loginStyle from "@/app/login/page.module.css";

export default function LoginPage() {
  return (
    <main className={`${loginStyle.loginPage} flex items-center justify-center md:h-200 `}>
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-1.5 p-4">
        <div className="flex h-20 w-full items-end p-3 justify-center">
          <div className={`${loginStyle.loginPageTitle} font-bold text-3xl `}>
            Bienvenido(a)<br></br>a Yura - Charlas
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}