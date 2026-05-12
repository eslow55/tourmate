import LoginCard from "../components/LoginCard";
import "../styles/LoginPage.css";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <div className="auth-page__inner">
        <LoginCard />
      </div>
    </div>
  );
}