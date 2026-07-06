import { BookOpen, CalendarRange } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
import Logo from './Logo';

interface NavbarProps {
  onOpenAppointments: () => void;
  onOpenBlogs: () => void;
}

export default function Navbar({ onOpenAppointments, onOpenBlogs }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-hairline sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <Logo theme="dark" id="nav-logo-btn" />

          {/* Navigation Links and Buttons */}
          <div className="flex items-center space-x-6">
            {/* Blogs Navlink */}
            <button
              onClick={onOpenBlogs}
              className="flex items-center space-x-1.5 text-xs sm:text-sm font-sans font-semibold text-ink-soft hover:text-forest transition-colors cursor-pointer focus:outline-none"
              id="nav-blogs-btn"
            >
              <BookOpen className="w-4 h-4 text-moss" />
              <span>Blogs</span>
            </button>
            
            {/* My Appointments Pill Button */}
            <button
              onClick={onOpenAppointments}
              className="bg-forest hover:bg-forest/90 text-white font-sans font-semibold text-xs px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 shadow-resting hover:shadow-elevated flex items-center space-x-1.5 cursor-pointer focus:outline-none"
              id="nav-appointments-btn"
            >
              <CalendarRange className="w-3.5 h-3.5 text-mint" />
              <span>My Appointments</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
