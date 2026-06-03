import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import SiteSettingsSync from './components/SiteSettingsSync';
import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';
import AboutUs from './pages/AboutUs';
import FAQSection from './components/FAQSection';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const GroupDetails = lazy(() => import('./pages/GroupDetails'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const RMDashboard = lazy(() => import('./pages/RMDashboard'));
const Articles = lazy(() => import('./pages/Articles'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogDetails = lazy(() => import('./pages/BlogDetails'));
const News = lazy(() => import('./pages/News'));
const Reviews = lazy(() => import('./pages/Reviews'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const CaseStudyDetails = lazy(() => import('./pages/CaseStudyDetails'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Stay = lazy(() => import('./pages/Stay'));
const Contact = lazy(() => import('./pages/Contact'));
const GetInTouch = lazy(() => import('./pages/GetInTouch'));
const SearchPage = lazy(() => import('./pages/Search'));
const Corporate = lazy(() => import('./pages/Corporate'));
const Comparison = lazy(() => import('./pages/Comparison'));
const UnitCONVERTERS = lazy(() => import('./pages/UnitConverters'));
const Action = lazy(() => import('./pages/Action'));
const NextHome = lazy(() => import('./pages/NextHome'));
const Strees = lazy(() => import('./pages/Strees'));
const TrustUs = lazy(() => import('./pages/TrustUs'));
const YoutubeVideo = lazy(() => import('./pages/YoutubeVideo'));
const Member = lazy(() => import('./pages/Member'));
const Prestigious = lazy(() => import('./pages/Prestigious'));
const ProminshesAndPlots = lazy(() => import('./pages/ProminshesAndPlots'));
const WhyBecomes = lazy(() => import('./pages/WhyBecomes'));
const GetMember = lazy(() => import('./pages/GetMember'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Route guards
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

const getDashboardPath = (user) => {
  if (user?.role === 'ADMIN') return '/admin';
  if (user?.role === 'RM') return '/rm';
  return '/user/dashboard';
};

const DashboardRedirector = () => {
  const { user } = useAuth();
  return <Navigate to={getDashboardPath(user)} replace />;
};

const AppContent = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const isPanel = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/rm') ||
    location.pathname.startsWith('/user') ||
    location.pathname === '/login';
  const isListingPage = location.pathname === '/properties';
  const isAdminOutsideDashboard = user?.role === 'ADMIN' &&
    !location.pathname.startsWith('/admin') &&
    location.pathname !== '/login';

  if (!loading && isAdminOutsideDashboard) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {!isPanel && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/groups/:id" element={<GroupDetails />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<BlogDetails />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetails />} />
            <Route path="/news" element={<News />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetails />} />
            <Route path="/faqs" element={<FAQSection/>} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/stay" element={<Stay />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/get-in-touch" element={<GetInTouch />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/corporate" element={<Corporate />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/calculator" element={<UnitCONVERTERS />} />
            <Route path="/unit-converters" element={<UnitCONVERTERS />} />
            <Route path="/action" element={<Action />} />
            <Route path="/next-home" element={<NextHome />} />
            <Route path="/strees" element={<Strees />} />
            <Route path="/trust-us" element={<TrustUs />} />
            <Route path="/youtube-video" element={<YoutubeVideo />} />
            <Route path="/prominshes-and-plots" element={<ProminshesAndPlots standalone />} />
            <Route path="/why-becomes" element={<WhyBecomes />} />
            <Route path="/get-member" element={<GetMember />} />

            {/* Central Dashboard Redirector */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRedirector />
              </ProtectedRoute>
            } />

            <Route path="/user/dashboard" element={
              <ProtectedRoute roles={['BUYER']}>
                <UserDashboard />
              </ProtectedRoute>
            } />

            {/* RM Routes */}
            <Route path="/rm" element={
              <ProtectedRoute roles={['RM']}>
                <RMDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isPanel && !isListingPage && <Footer />}
      <CookieBanner />
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <SiteSettingsSync />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
