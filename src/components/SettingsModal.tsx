import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Shield, Palette, LogOut, Camera } from 'lucide-react';
import Avatar from './Avatar';
import { updateUser } from '../store';

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const { state, dispatch, logout, addToast } = useApp();
  const [tab, setTab] = useState<'profile' | 'account' | 'interface'>('profile');
  const user = state.currentUser;

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  if (!user) return null;

  const handleSaveProfile = () => {
    if (name.trim().length < 1) {
      addToast('Имя не может быть пустым', 'error');
      return;
    }
    if (username.length < 4) {
      addToast('Username минимум 4 символа', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      addToast('Username: только латинские буквы, цифры и _', 'error');
      return;
    }
    const updated = updateUser(user.id, { name: name.trim(), username, bio });
    if (updated) {
      dispatch({ type: 'SET_USER', user: updated });
      addToast('Профиль обновлён', 'success');
    }
  };

  const handleChangePassword = () => {
    if (newPassword.length < 8) {
      addToast('Пароль минимум 8 символов', 'error');
      return;
    }
    if (newPassword !== newPassword2) {
      addToast('Пароли не совпадают', 'error');
      return;
    }
    // Update password in store
    const passwords = JSON.parse(localStorage.getItem('chatflow_passwords') || '{}');
    passwords[user.id] = btoa(newPassword);
    localStorage.setItem('chatflow_passwords', JSON.stringify(passwords));
    setOldPassword('');
    setNewPassword('');
    setNewPassword2('');
    addToast('Пароль изменён', 'success');
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const tabs = [
    { id: 'profile' as const, label: 'Профиль', icon: User },
    { id: 'account' as const, label: 'Аккаунт', icon: Shield },
    { id: 'interface' as const, label: 'Интерфейс', icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Настройки</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-all-fast hover:opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all-fast"
              style={{
                backgroundColor: tab === t.id ? 'var(--color-primary-light)' : 'transparent',
                color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {tab === 'profile' && (
            <div className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar user={user} size={72} />
                  <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{user.name}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>@{user.username}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>О себе</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm resize-none"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="Расскажите о себе..."
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-xl text-white font-medium text-sm transition-all-fast hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Сохранить
              </button>
            </div>
          )}

          {tab === 'account' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Текущий пароль</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="Минимум 8 символов"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Подтвердите пароль</label>
                <input
                  type="password"
                  value={newPassword2}
                  onChange={e => setNewPassword2(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                />
              </div>
              <button
                onClick={handleChangePassword}
                className="w-full py-2.5 rounded-xl text-white font-medium text-sm transition-all-fast hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Сменить пароль
              </button>

              <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all-fast hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-danger)', border: '1px solid var(--color-border)' }}
                >
                  <LogOut className="w-4 h-4" />
                  Выйти из аккаунта
                </button>
              </div>
            </div>
          )}

          {tab === 'interface' && (
            <div className="space-y-5">
              {/* Theme */}
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>Тема оформления</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => dispatch({ type: 'SET_THEME', theme: 'light' })}
                    className="flex-1 p-4 rounded-xl text-center transition-all-fast"
                    style={{
                      backgroundColor: state.theme === 'light' ? 'var(--color-primary-light)' : 'var(--color-bg-tertiary)',
                      border: state.theme === 'light' ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    }}
                  >
                    <div className="w-8 h-8 rounded-full mx-auto mb-2 bg-white border" />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Светлая</span>
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_THEME', theme: 'dark' })}
                    className="flex-1 p-4 rounded-xl text-center transition-all-fast"
                    style={{
                      backgroundColor: state.theme === 'dark' ? 'var(--color-primary-light)' : 'var(--color-bg-tertiary)',
                      border: state.theme === 'dark' ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    }}
                  >
                    <div className="w-8 h-8 rounded-full mx-auto mb-2 bg-gray-800" />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Тёмная</span>
                  </button>
                </div>
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Звук сообщений</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Воспроизводить звук при новом сообщении</p>
                </div>
                <button
                  onClick={() => dispatch({ type: 'SET_SETTINGS', settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled } })}
                  className="w-12 h-6 rounded-full transition-all-fast relative"
                  style={{ backgroundColor: state.settings.soundEnabled ? 'var(--color-primary)' : 'var(--color-bg-tertiary)' }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all-fast"
                    style={{ left: state.settings.soundEnabled ? '26px' : '2px' }}
                  />
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Уведомления</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Показывать уведомления браузера</p>
                </div>
                <button
                  onClick={() => dispatch({ type: 'SET_SETTINGS', settings: { ...state.settings, notificationsEnabled: !state.settings.notificationsEnabled } })}
                  className="w-12 h-6 rounded-full transition-all-fast relative"
                  style={{ backgroundColor: state.settings.notificationsEnabled ? 'var(--color-primary)' : 'var(--color-bg-tertiary)' }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all-fast"
                    style={{ left: state.settings.notificationsEnabled ? '26px' : '2px' }}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
