import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LogoIcon from "@/assets/svgs/LogoIcon";
import { TextField, Button } from "@/components";
import EmailIcon from "@/assets/svgs/EmailIcon";
import LockIcon from "@/assets/svgs/LockIcon";
import EyeIcon from "@/assets/svgs/EyeIcon";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/useAuthStore";

const removeCredentialSpaces = (value: string) => value.replace(/[\s\u00a0\u200b-\u200d\ufeff]/g, "");

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tokens = useAuthStore((state) => state.tokens);
  const setTokens = useAuthStore((state) => state.setTokens);
  const locationState = location.state as { from?: string; forceLogin?: boolean } | null;
  const from = locationState?.from ?? "/home";
  const forceLogin = locationState?.forceLogin === true;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tokens && !forceLogin) {
      navigate(from, { replace: true });
    }
  }, [tokens, forceLogin, from, navigate]);

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = removeCredentialSpaces(email);
    const normalizedPassword = removeCredentialSpaces(password);
    setEmail(normalizedEmail);
    setPassword(normalizedPassword);
    setIsLoading(true);
    try {
      const response = await authApi.login({ email: normalizedEmail, password: normalizedPassword });
      setTokens(response.data);
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      alert(message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-noto">
      <div className="w-full max-w-[480px] bg-white px-[56px] py-[75px] shadow-[0px_5px_15px_0px_rgba(0,0,0,0.25)] rounded-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-[40px] mb-[40px]">
          <div className="flex flex-col items-center gap-[20px]">
            <LogoIcon className="size-[76px]" />
            <h1 className="text-Headline_L_Bold text-black">FinVest</h1>
          </div>
          <p className="text-Subtitle_L_Regular text-black text-center">
            간편하게 시작하고 스마트하게 관리하세요
          </p>
        </div>

        {/* Local Login Form */}
        <form onSubmit={handleLocalLogin} className="flex flex-col gap-[12px] mb-[24px]">
          <TextField
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(removeCredentialSpaces(e.target.value))}
            leftIcon={<EmailIcon className="size-[24px] text-gray-400" />}
            fullWidth
          />
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(removeCredentialSpaces(e.target.value))}
            leftIcon={<LockIcon className="size-[24px] text-gray-400" />}
            rightIcon={<EyeIcon />}
            onRightIconClick={() => setShowPassword(!showPassword)}
            fullWidth
          />
          <Button 
            type="submit" 
            fullWidth 
            loading={isLoading}
            className="bg-black text-white py-3 rounded-lg mt-2"
          >
            로그인
          </Button>
        </form>

        {/* Signup Link */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-main-1 text-Body_M_Regular hover:underline"
          >
            아직 계정이 없으신가요? 회원가입하기
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
