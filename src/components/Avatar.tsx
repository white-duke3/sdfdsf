import React from 'react';
import { User } from '../types';

interface Props {
  user: User;
  size?: number;
  className?: string;
}

const colors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

function getColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Avatar({ user, size = 40, className = '' }: Props) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`rounded-full object-cover ring-2 ring-white dark:ring-gray-800 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white shadow-md ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: getColor(user.id),
        fontSize: size * 0.38,
      }}
    >
      {getInitials(user.name)}
    </div>
  );
}
