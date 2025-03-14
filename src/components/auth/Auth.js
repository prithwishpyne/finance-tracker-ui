import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Container, Paper, Typography, Button } from "@mui/material";
import styles from "./Auth.module.css";
import Login from "./Login";
import Register from "./Register";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { setIsAuthenticated } = useOutletContext() || {};

  return (
    <Container
      maxWidth="sm"
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper
        elevation={3}
        className={styles.authContainer}
        sx={{ background: "#edede9" }}
      >
        <div className={styles.header}>
          <Typography
            sx={{ fontSize: "32px", fontWeight: "600", color: "#003049" }}
          >
            Welcome to FinanceTrack
          </Typography>
          <Typography color="textPrimary">
            Manage your personal finances with ease
          </Typography>
        </div>
        {isLogin ? (
          <Login setIsAuthenticated={setIsAuthenticated} />
        ) : (
          <Register setIsAuthenticated={setIsAuthenticated} />
        )}
        <div className={styles.switchMode}>
          <Button
            color="primary"
            onClick={() => setIsLogin(!isLogin)}
            sx={{ textTransform: "none" }}
          >
            {isLogin
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </Paper>
    </Container>
  );
};

export default Auth;
