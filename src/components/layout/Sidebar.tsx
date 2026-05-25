import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Home,
  FolderOpen,
  Download,
  Settings,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, path: '/', label: 'Home' },
  { icon: Search, path: '/search', label: 'Search' },
  { icon: FolderOpen, path: '/library', label: 'Library' },
  { icon: Download, path: '/downloads', label: 'Downloads' },
  { icon: Settings, path: '/settings', label: 'Settings' },
];

export function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const springConfig = {
    type: 'spring' as const,
    stiffness: 800,
    damping: 35,
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isHovered ? 240 : 80 }}
      transition={springConfig}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredIndex(null);
      }}
      className="fixed left-0 top-0 z-[100] flex h-screen flex-col overflow-hidden border-r border-white/10 bg-[#141414] backdrop-blur-md"
    >
      {/* Profile */}
      <div className="mt-6 mb-8 px-4">
        <div className="group flex w-full cursor-pointer items-center py-1">
          <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-transparent transition-all duration-300 group-hover:border-[#E50914]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <User
                size={20}
                className="text-gray-300 transition-colors group-hover:text-white"
              />
            </div>
          </div>

          <motion.span
            animate={{
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : -10,
            }}
            transition={springConfig}
            className="ml-4 whitespace-nowrap font-bold text-white"
          >
            My Profile
          </motion.span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col justify-center gap-2">
        {navItems.map((item, index) => {
          const isShrunk =
            hoveredIndex !== null && hoveredIndex !== index;

          return (
            <motion.div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              animate={{
                scale: isShrunk ? 0.9 : 1,
                opacity: isShrunk ? 0.4 : 1,
              }}
              transition={springConfig}
              className="relative flex items-center"
            >
              <NavLink
                to={item.path}
                className="flex w-full items-center px-4 py-1"
              >
                {({ isActive }) => (
                  <div className="flex w-full items-center">
                    <div
                      className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-[#E50914]'
                          : 'border-transparent'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-[#E50914] text-white'
                            : 'bg-white/5 text-gray-300'
                        }`}
                      >
                        <item.icon size={20} />
                      </div>
                    </div>

                    <motion.span
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : -10,
                      }}
                      whileHover={{
                        scale: 1.1,
                        x: 5,
                      }}
                      transition={springConfig}
                      className="ml-4 whitespace-nowrap font-bold text-gray-100"
                    >
                      {item.label}
                    </motion.span>
                  </div>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>
    </motion.aside>
  );
}