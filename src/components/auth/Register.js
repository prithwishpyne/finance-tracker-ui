import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Google as GoogleIcon } from "@mui/icons-material";
import styles from "./Register.module.css";
import { supabase } from "../../supabaseClient";
import axiosInstance from "../../utils/axiosConfig";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const { data } = await axiosInstance.post("/register", {
        username: formData.email,
        password: formData.password,
        name: formData.name,
      });

      // Show success message and navigate to auth page for login
      alert("Registration successful! Please login.");
      navigate("/auth");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
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
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        <div className={styles.formGroup}>
          <TextField
            fullWidth
            id="name"
            name="name"
            type="text"
            label="Full Name"
            required
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            size="small"
            sx={{ m: 0 }}
            inputProps={{ style: { fontSize: 15 } }}
          />
        </div>
        <div className={styles.formGroup}>
          <TextField
            fullWidth
            id="email"
            name="email"
            type="email"
            label="Email address"
            required
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            size="small"
            sx={{ m: 0 }}
            inputProps={{ style: { fontSize: 15 } }}
          />
        </div>
        <div className={styles.formGroup}>
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            required
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            size="small"
            sx={{ m: 0 }}
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { fontSize: 15 },
            }}
          />
        </div>
        <div className={styles.formGroup}>
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            size="small"
            type={showConfirmPassword ? "text" : "password"}
            sx={{ m: 0 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { fontSize: 15 },
            }}
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{
            textTransform: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            m: 0,
          }}
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
          sx={{
            textTransform: "none",
            backgroundColor: "#fff",
            color: "#007bff",
            m: 0,
          }}
        >
          Continue with Google
        </Button>
      </form>
    </div>
  );
};

export default Register;
