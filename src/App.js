import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { initSocket, disconnectSocket } from "./services/socket";

import Home from "./pages/Home";
import Navbar from "./components/common/Navbar";
import OpenRoute from "./components/core/Auth/OpenRoute";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Error from "./pages/Error";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";

// Public pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import Catalog from "./pages/Catalog";
import CourseDetails from "./pages/CourseDetails";

// Dashboard pages
import Dashboard from "./pages/Dashboard";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Settings from "./components/core/Dashboard/Settings";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import Cart from "./components/core/Dashboard/Cart";
import AddCourse from "./components/core/Dashboard/AddCourse";
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./components/core/Dashboard/EditCourse";
import Instructor from "./components/core/Dashboard/InstructorDashboard/Instructor";

// New feature pages
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";
import Analytics from "./pages/Analytics";
import AdminPanel from "./pages/AdminPanel";
import PaymentHistory from "./pages/PaymentHistory";

// Chat
import ChatButton from "./components/core/Chat/ChatButton";
import ChatWindow from "./components/core/Chat/ChatWindow";


function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { isOpen } = useSelector((state) => state.chat);

  // Initialize socket when user logs in
  useEffect(() => {
    if (token) {
      initSocket(token, dispatch);
    } else {
      disconnectSocket();
    }
  }, [token, dispatch]);

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar />
      <div className="pt-16">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="catalog/:catalogName" element={<Catalog />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="signup" element={<OpenRoute><Signup /></OpenRoute>} />
          <Route path="login" element={<OpenRoute><Login /></OpenRoute>} />
          <Route path="forgot-password" element={<OpenRoute><ForgotPassword /></OpenRoute>} />
          <Route path="verify-email" element={<OpenRoute><VerifyEmail /></OpenRoute>} />
          <Route path="update-password/:id" element={<OpenRoute><UpdatePassword /></OpenRoute>} />

          {/* Dashboard */}
          <Route element={<PrivateRoute><Dashboard /></PrivateRoute>}>
            <Route path="dashboard/my-profile" element={<MyProfile />} />
            <Route path="dashboard/Settings" element={<Settings />} />
            <Route path="dashboard/analytics" element={<Analytics />} />

            {/* Student routes */}
            <Route path="dashboard/cart" element={<Cart />} />
            <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
            <Route path="dashboard/payment-history" element={<PaymentHistory />} />

            {/* Instructor routes */}
            <Route path="dashboard/instructor" element={<Instructor />} />
            <Route path="dashboard/add-course" element={<AddCourse />} />
            <Route path="dashboard/my-courses" element={<MyCourses />} />
            <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />

            {/* Admin routes */}
            <Route path="dashboard/admin" element={<AdminPanel />} />
          </Route>

          {/* Video player */}
          <Route element={<PrivateRoute><ViewCourse /></PrivateRoute>}>
            <Route
              path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
              element={<VideoDetails />}
            />
          </Route>

          <Route path="*" element={<Error />} />
        </Routes>
      </div>

      {/* Floating chat (visible for logged-in users) */}
      {token && (
        <>
          {!isOpen && <ChatButton />}
          {isOpen && <ChatWindow />}
        </>
      )}
    </div>
  );
}

export default App;
