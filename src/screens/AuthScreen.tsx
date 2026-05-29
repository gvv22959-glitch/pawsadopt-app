import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, User, PawPrint, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface AuthScreenProps {
  onAuthSuccess: (user: { id: string; email: string | undefined }) => void;
  onBack?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

const InputField = ({
  icon,
  type,
  placeholder,
  value,
  onChange,
  error,
  rightElement,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  rightElement?: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className={cn(
      'flex items-center gap-3 h-14 px-4 rounded-2xl border-2 transition-all duration-200 bg-surface-variant/40',
      error
        ? 'border-red-400 bg-red-50'
        : 'border-transparent focus-within:border-primary/40 focus-within:bg-white'
    )}>
      <span className={cn('flex-shrink-0 transition-colors', error ? 'text-red-400' : 'text-outline')}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-outline/60 font-medium"
      />
      {rightElement}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs text-red-500 flex items-center gap-1 pl-1"
        >
          <AlertCircle size={12} />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [globalError, setGlobalError] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNickname('');
    setErrors({});
    setGlobalError('');
    setSuccessMsg('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  const switchMode = (m: AuthMode) => {
    resetForm();
    setMode(m);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = '请输入邮箱地址';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = '邮箱格式不正确';

    if (mode !== 'forgot') {
      if (!password) newErrors.password = '请输入密码';
      else if (password.length < 6) newErrors.password = '密码至少 6 位';
    }
    if (mode === 'register') {
      if (!nickname.trim()) newErrors.nickname = '请输入昵称';
      if (!confirmPassword) newErrors.confirmPassword = '请确认密码';
      else if (confirmPassword !== password) newErrors.confirmPassword = '两次密码不一致';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setGlobalError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        onAuthSuccess({ id: data.user.id, email: data.user.email });
      }
    } catch (err: any) {
      const msg = err?.message || '登录失败，请稍后再试';
      if (msg.includes('Invalid login credentials')) setGlobalError('邮箱或密码错误，请重试');
      else if (msg.includes('Email not confirmed')) setGlobalError('邮箱尚未验证，请查收验证邮件');
      else setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setGlobalError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname } },
      });
      if (error) throw error;
      if (data.user && data.session) {
        onAuthSuccess({ id: data.user.id, email: data.user.email });
      } else {
        setSuccessMsg('注册成功！请查收验证邮件，点击链接激活账号后即可登录。');
      }
    } catch (err: any) {
      const msg = err?.message || '注册失败，请稍后再试';
      if (msg.includes('already registered')) setGlobalError('该邮箱已注册，请直接登录');
      else setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!validate()) return;
    setLoading(true);
    setGlobalError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSuccessMsg('重置链接已发送至您的邮箱，请查收并按指引操作。');
    } catch (err: any) {
      setGlobalError(err?.message || '发送失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'login') handleLogin();
    else if (mode === 'register') handleRegister();
    else handleForgot();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="relative h-64 flex-shrink-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=800"
          className="absolute inset-0 w-full h-full object-cover"
          alt="宠物"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background" />

        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-12 left-5 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Logo */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center">
            <PawPrint size={30} className="text-primary" />
          </div>
          <h1 className="text-white text-xl font-bold drop-shadow-md">PawsAdopt</h1>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 -mt-6 bg-white rounded-t-[32px] px-6 pt-6 pb-10 shadow-2xl">
        {/* Tab switcher */}
        {mode !== 'forgot' && (
          <div className="flex bg-surface-variant/50 rounded-2xl p-1 mb-6">
            {(['login', 'register'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  'flex-1 h-10 rounded-xl text-sm font-bold transition-all duration-300',
                  mode === m
                    ? 'bg-white shadow-md text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>
        )}

        {/* Forgot password header */}
        {mode === 'forgot' && (
          <div className="mb-6">
            <button
              onClick={() => switchMode('login')}
              className="flex items-center gap-2 text-primary text-sm font-semibold mb-4"
            >
              <ArrowLeft size={16} />
              返回登录
            </button>
            <h2 className="text-xl font-bold">忘记密码</h2>
            <p className="text-sm text-on-surface-variant mt-1">输入您的邮箱，我们将发送重置链接</p>
          </div>
        )}

        {/* Success message */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-4 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-start gap-3"
            >
              <CheckCircle2 size={20} className="text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-on-secondary-container leading-relaxed">{successMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global error */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 leading-relaxed">{globalError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {mode === 'register' && (
              <InputField
                icon={<User size={18} />}
                type="text"
                placeholder="昵称（将显示在您的主页）"
                value={nickname}
                onChange={setNickname}
                error={errors.nickname}
              />
            )}
            <InputField
              icon={<Mail size={18} />}
              type="email"
              placeholder="电子邮箱"
              value={email}
              onChange={setEmail}
              error={errors.email}
            />
            {mode !== 'forgot' && (
              <InputField
                icon={<Lock size={18} />}
                type={showPassword ? 'text' : 'password'}
                placeholder="密码（至少 6 位）"
                value={password}
                onChange={setPassword}
                error={errors.password}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-outline hover:text-primary transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            )}
            {mode === 'register' && (
              <InputField
                icon={<Lock size={18} />}
                type={showConfirm ? 'text' : 'password'}
                placeholder="确认密码"
                value={confirmPassword}
                onChange={setConfirmPassword}
                error={errors.confirmPassword}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-outline hover:text-primary transition-colors p-1"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Forgot password link */}
        {mode === 'login' && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => switchMode('forgot')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              忘记密码？
            </button>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !!successMsg}
          className={cn(
            'w-full h-14 rounded-full font-bold text-base flex items-center justify-center gap-2 mt-6 transition-all',
            'bg-primary text-white shadow-lg shadow-primary/30',
            'hover:bg-primary/90 active:scale-95',
            (loading || !!successMsg) && 'opacity-60 pointer-events-none'
          )}
        >
          {loading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <>
              {mode === 'login' && '登录'}
              {mode === 'register' && '创建账号'}
              {mode === 'forgot' && '发送重置邮件'}
            </>
          )}
        </button>

        {/* Register terms */}
        {mode === 'register' && (
          <p className="text-center text-[11px] text-outline mt-4 leading-relaxed">
            注册即表示您同意{' '}
            <span className="text-primary font-semibold">《服务条款》</span>
            {' '}和{' '}
            <span className="text-primary font-semibold">《隐私政策》</span>
          </p>
        )}

        {/* Divider */}
        {mode === 'login' && (
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-outline">或</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>
        )}

        {/* Guest access */}
        {mode === 'login' && (
          <button
            onClick={() => onAuthSuccess({ id: 'guest', email: undefined })}
            className="w-full h-12 rounded-full border-2 border-outline-variant text-on-surface-variant text-sm font-semibold hover:border-primary hover:text-primary active:scale-95 transition-all"
          >
            以游客身份浏览
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
