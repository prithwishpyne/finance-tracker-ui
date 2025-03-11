import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import styles from "./Register.module.css";
import { supabase } from "../../supabaseClient";

const Register = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      // Show success message and navigate to auth page for login
      alert("Registration successful! Please login.");
      navigate("/auth");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      // Don't set authentication state or navigate here
      // The redirect will handle that after successful OAuth
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.header}>
        <h2 className={styles.createText}>Create your account</h2>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          id="name"
          name="name"
          type="text"
          label="Full Name"
          variant="outlined"
          required
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          sx={{ mt: 3, background: "#fff" }}
        />
        <TextField
          fullWidth
          id="email"
          name="email"
          type="email"
          label="Email address"
          variant="outlined"
          required
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          sx={{ m: 0, background: "#fff" }}
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          type="password"
          label="Password"
          variant="outlined"
          required
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          sx={{ m: 0, background: "#fff" }}
        />
        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          variant="outlined"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          margin="normal"
          sx={{ m: 0, background: "#fff" }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create account"
          )}
        </Button>
        <div className={styles.divider}>
          <Typography variant="body2" color="textSecondary">
            or
          </Typography>
        </div>
        <Button
          type="button"
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Continue with Google
        </Button>
      </form>
    </div>
  );
};

export default Register;
