import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { Button, CircularProgress } from "@mui/material";
import styles from "./App.module.css";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ProfileModal from "./components/profile/ProfileModal";

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("token") !== null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
  const location = useLocation();

  const handleNameUpdate = (newName) => {
    setUserName(newName);
    localStorage.setItem("userName", newName);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          // If we have a session, sync with our backend
          const user = session.user;
          const response = await fetch("http://localhost:8000/oauth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.user_metadata?.full_name || "",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to sync user data");
          }

          const tokenData = await response.json();
          localStorage.setItem("token", tokenData.access_token);
          localStorage.setItem("userName", tokenData.name);
          setUserName(tokenData.name);
          setIsAuthenticated(true);
        } else {
          const token = localStorage.getItem("token");
          const storedName = localStorage.getItem("userName");
          setUserName(storedName || "");
          setIsAuthenticated(token !== null);
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        localStorage.setItem("token", session.access_token);
        setIsAuthenticated(true);
      }
    });

    checkAuth();

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.app}>
        <div className={styles.appLoading}>
          <div className={styles.loadingSpinner}></div>
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== "/auth") {
    return <Navigate to="/auth" replace />;
  }

  if (isAuthenticated && location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={styles.app}>
      {isAuthenticated && (
        <nav className={styles.navbar}>
          <h1 className={styles.headerText}>FinanceTrack</h1>
          <div className={styles.navbarActions}>
            <Button
              onClick={() => setShowProfileModal(true)}
              sx={{
                fontSize: "16px",
                textTransform: "none",
                color: "#fff",
                fontWeight: "500",
              }}
              startIcon={<AccountCircleIcon />}
            >
              Profile
            </Button>
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem("token");
                setIsAuthenticated(false);
              }}
              sx={{
                fontSize: "16px",
                textTransform: "none",
                color: "#fff",
                fontWeight: "500",
              }}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </div>
        </nav>
      )}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userName={userName}
        onNameChange={handleNameUpdate}
      />
      <main className={styles.mainContent}>
        <Outlet context={{ setIsAuthenticated, userName }} />
      </main>
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
