import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../redux/authSlice';

const Sidebar = ({ navItems }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <motion.aside
      className="sticky top-0 z-40 flex w-full flex-col gap-3 border-b border-white/5 bg-gray-900/90 p-4 shadow-xl backdrop-blur-md md:h-screen md:w-[260px] md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:p-6 md:py-8"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Top Bar: Brand & Profile/Logout Actions on Mobile */}
      <div className="flex items-center justify-between w-full md:block md:mb-10">
        {/* Brand */}
        <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white md:pl-2 md:text-2xl">
          <span className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
          Maintainiq
        </div>

        {/* Mobile Action Container (Hidden on Desktop) */}
        <div className="flex items-center gap-3 md:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
            {userInfo?.name?.charAt(0) || 'U'}
          </span>
          <button
            className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-medium text-gray-400 active:bg-red-500/10 active:text-red-400"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Links (Scrollable row on mobile, column on desktop) */}
      <nav className="flex flex-row gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-1 md:flex-col md:overflow-visible md:pb-0">
        {navItems.map((item) => {
          const isActive = location.hash === item.key || item.active;
          return (
            <button
              key={item.key}
              className={`flex cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-all md:px-[18px] md:py-[14px] md:text-[0.95rem] ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 font-semibold border-b-2 border-indigo-500 md:border-b-0 md:border-l-3 md:rounded-l-none'
                  : 'text-gray-400 hover:bg-white/[0.04] hover:text-white md:hover:translate-x-1'
              }`}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Desktop Footer (Hidden on Mobile) */}
      <div className="hidden md:flex md:flex-col md:items-stretch md:gap-4 md:border-t md:border-white/5 md:pt-6">
        <div className="flex items-center gap-3 rounded-xl border border-transparent p-2 bg-white/[0.02] hover:border-white/10 transition-colors">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-md shadow-indigo-500/20">
            {userInfo?.name?.charAt(0) || 'U'}
          </span>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold text-white">
              {userInfo?.name}
            </span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {userInfo?.role}
            </span>
          </div>
        </div>

        <button
          className="cursor-pointer rounded-xl border border-white/10 py-3 text-sm font-medium text-gray-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;