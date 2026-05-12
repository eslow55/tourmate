import RegisterCard from "../components/RegisterCard";
import "../styles/LoginPage.css";

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <div className="auth-page__inner">
        <RegisterCard />
      </div>
    </div>
  );
}