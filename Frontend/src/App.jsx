import home from './assets/home.png';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from "./pages/LandingPage";
import Auth from './pages/Auth';
import VideoMeet from './pages/VideoMeet';
import Home from './pages/Home';
import ProtectedRoute from "./services/ProtectRoute";


function AppLayout() {
  const location = useLocation();

  // Define routes where navbar should NOT be shown
  const hideNavbarOnPaths = ['/room']; // We'll do a check that path starts with /room

  // Check if current path starts with any path in hideNavbarOnPaths
  const shouldHideNavbar = hideNavbarOnPaths.some(path => location.pathname.startsWith(path));

  return (
    <div
      className="h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${home})` }}
    >
      {/* Black overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-0" />

      {/* Show Navbar only if not on /room route */}
      {!shouldHideNavbar && <Navbar />}

      {/* Page content */}
      <div className="relative z-10  w-full">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/room/:roomId" element={<VideoMeet />} />
        </Routes>
      </div>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
