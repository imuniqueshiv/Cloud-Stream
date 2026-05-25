import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export default function MainLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-brand-dark text-brand-light">

      <Sidebar />

      <main className="h-full overflow-y-auto pl-20">
        <Outlet />
      </main>

    </div>
  );
}