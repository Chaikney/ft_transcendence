import { useState } from 'react';

// 🛠️ Aquí pones las rutas exactas de las imágenes que metiste en tu carpeta public
const PREDEFINED_AVATARS = [
  '/avatars/cherry.png',
  '/avatars/kirito.png',
  '/avatars/roxas.png',
  '/avatars/tet.png',
  '/avatars/default.png',
  '/avatars/ben10.png',
  '/avatars/cloud.png',
  '/avatars/doom.png',
  '/avatars/ghostrider.png',
  '/avatars/halo.png',
  '/avatars/ironman.png',
  '/avatars/jake.png',
  '/avatars/link.png',
  '/avatars/moonknight.png',
  '/avatars/nightwing.png',
  '/avatars/reed.png',
  '/avatars/shadow.png',
  '/avatars/sonic.png',
  '/avatars/spawn.png',
  '/avatars/vader.png',
  '/avatars/zero.png'
];

interface AvatarPickerProps {
  currentAvatar: string;
  onSelect: (newAvatarPath: string) => void;
  onClose: () => void;
}

export const AvatarPicker = ({ currentAvatar, onSelect, onClose }: AvatarPickerProps) => {
  return (
    <div className="absolute top-full mt-2 left-0 bg-[#0f0f13] border border-[#2a2a35] p-3 rounded shadow-2xl z-50 w-64">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-mono text-gray-400">SELECT_IDENTITY</span>
        <button onClick={onClose} className="text-gray-500 hover:text-[#ff3366] text-xs">✕</button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {PREDEFINED_AVATARS.map((avatarPath) => (
          <img
            key={avatarPath}
            src={avatarPath}
            alt="Avatar option"
            onClick={() => {
              onSelect(avatarPath);
              onClose();
            }}
            className={`w-full aspect-square object-cover rounded cursor-pointer transition-all duration-200 
              ${currentAvatar === avatarPath ? 'ring-2 ring-[#ff3366] opacity-100' : 'opacity-60 hover:opacity-100 hover:ring-1 hover:ring-gray-500'}
            `}
          />
        ))}
      </div>
    </div>
  );
};