import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const { login, register, addToast } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const error = login(loginEmail, loginPassword);
    setLoading(false);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Добро пожаловать!', 'success');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regPassword2) {
      addToast('Пароли не совпадают', 'error');
      return;
    }
    if (regPassword.length < 8) {
      addToast('Пароль минимум 8 символов', 'error');
      return;
    }
    if (regUsername.length < 4) {
      addToast('Username минимум 4 символа', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(regUsername)) {
      addToast('Username: только латинские буквы, цифры и _', 'error');
      return;
    }
    setLoading(true);
    const error = register({
      name: regName,
      username: regUsername,
      email: regEmail,
      password: regPassword,
    });
    setLoading(false);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast('Регистрация успешна!', 'success');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-warm">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-lg gradient-primary">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>ChatFlow</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Современный мессенджер для общения</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl shadow-xl p-8 card">
          {/* Tabs */}
          <div className="flex mb-6 rounded-xl p-1" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all-fast"
              style={{
                backgroundColor: isLogin ? 'var(--color-surface)' : 'transparent',
                color: isLogin ? 'var(--color-text)' : 'var(--color-text-secondary)',
                boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all-fast"
              style={{
                backgroundColor: !isLogin ? 'var(--color-surface)' : 'transparent',
                color: !isLogin ? 'var(--color-text)' : 'var(--color-text-secondary)',
                boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Регистрация
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all-fast"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all-fast"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-medium text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Загрузка...' : 'Войти'}
              </button>
              <div className="text-center text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
                <p>Тестовые аккаунты:</p>
                <p className="mt-1">alice@chatflow.app / bob@chatflow.app</p>
                <p>Пароль: password123</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Имя</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all-fast"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Username</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value.replace(/\s/g, ''))}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all-fast"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="username"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Мин. 4 символа, латинские буквы, цифры, _</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all-fast"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Пароль</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all-fast"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="Минимум 8 символов"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Повтор пароля</label>
                <input
                  type="password"
                  value={regPassword2}
                  onChange={e => setRegPassword2(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all-fast"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="Повторите пароль"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-medium text-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Загрузка...' : 'Создать аккаунт'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
