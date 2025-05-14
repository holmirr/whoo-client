"use client";

export default function ModeButton({ children, onClick, disabled }: { children: React.ReactNode, onClick: () => void, disabled: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
        disabled
          ? 'cursor-not-allowed'
          : 'opacity-50 hover:bg-blue-600 hover:opacity-100 cursor-pointer'
      }`}
    >{children}</button>
  )
}


