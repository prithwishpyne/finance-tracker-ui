import React, { useState } from "react";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";
import styles from "../transactions/TransactionModal.module.css";
import axiosInstance from "../../utils/axiosConfig";

const ProfileModal = ({ isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.put("/profile", {
        name: formData.name,
      });

      localStorage.setItem("userName", formData.name);
      onUpdate(formData.name);
      onClose();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to update profile");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "#fff",
          boxShadow: 10,
          p: 5,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <Typography sx={{ fontSize: "22px", fontWeight: "600" }}>
            Update Profile
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              minHeight: 0,
              minWidth: 0,
              padding: 0,
              "&:hover": {
                background: "transparent",
              },
            }}
          >
            <Close />
          </Button>
        </Box>
        <form onSubmit={handleSubmit} className={styles.formGroup}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, textTransform: "none" }}
          >
            Update Profile
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default ProfileModal;
