import { Outlet } from 'react-router';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
