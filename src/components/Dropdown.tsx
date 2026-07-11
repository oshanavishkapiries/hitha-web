"use client";

import React, { useState } from 'react';
import { ChevronDown, BadgeCheck } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  buttonClassName?: string;
}

export default function Dropdown({ options, value, onChange, placeholder = 'Select an option', id, buttonClassName }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(opt => opt.value === value)?.label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={buttonClassName || "w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink flex justify-between items-center cursor-pointer transition-all outline-none"}
        id={id}
      >
        <span className={value ? 'text-ink font-semibold' : 'text-ink-soft/40'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-ink-soft transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <ul className="absolute z-20 w-full mt-1.5 bg-white border border-hairline rounded-xl shadow-elevated max-h-60 overflow-y-auto outline-none py-1.5 animate-fade-in">
            {options.map(opt => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-sprout/20 text-forest font-bold'
                        : 'text-ink hover:bg-cream/40 hover:text-forest'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <BadgeCheck className="w-4 h-4 text-forest" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
