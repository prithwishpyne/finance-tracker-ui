import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { supabase } from "../../supabaseClient";
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
import axiosInstance from "../../utils/axiosConfig";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/login",
        {
          username: formData.username,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(response);

      const data = response.data;

      if (response.status !== 200 || !data.access_token) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("userName", data.name);
      setIsAuthenticated(true);
      navigate("/dashboard");
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      console.log(data);

      if (error) throw error;

      // Get the user data from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Send user data to our backend
        const response = await axiosInstance.post("/oauth/google", {
          email: user.email,
          name: user.user_metadata?.full_name || "",
        });

        const tokenData = response.data;
        localStorage.setItem("token", tokenData.access_token);
        setIsAuthenticated(true);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.header}>
        <Typography sx={{ fontSize: "22px", fontWeight: "600" }}>
          Sign in to your account
        </Typography>
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
            id="username"
            name="username"
            type="email"
            label="Email address"
            required
            value={formData.username}
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
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
        </Button>
        <div className={styles.divider}>OR</div>
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={<GoogleIcon />}
          sx={{
            textTransform: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            m: 0,
          }}
        >
          Continue with Google
        </Button>
      </form>
    </div>
  );
};

export default Login;
