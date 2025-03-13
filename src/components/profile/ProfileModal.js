import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";
import { Close, Edit } from "@mui/icons-material";
import axiosInstance from "../../utils/axiosConfig";

const ProfileModal = ({ isOpen, onClose, userName, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [storedName, setStoredName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Entered useEffect");
    // Fetch the name from localStorage when component mounts, userName changes, or modal opens
    const nameFromStorage = localStorage.getItem("userName");
    console.log(nameFromStorage);
    if (nameFromStorage) {
      setEditedName(nameFromStorage);
      setStoredName(nameFromStorage);
    } else if (userName) {
      setEditedName(userName);
      setStoredName(userName);
    }
  }, [userName, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Call the API to update the name
      const response = await axiosInstance.put("/users/update-name", {
        name: editedName,
      });

      // Update local storage with the new name
      localStorage.setItem("userName", response.data.name);
      setStoredName(response.data.name);
      setIsEditing(false);

      // Notify parent component about the name change
      if (onNameChange) {
        onNameChange(response.data.name);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to update name. Please try again."
      );
      console.error("Error updating name:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "#fff",
          boxShadow: 10,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">User Details</Typography>
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
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, color: "#000", fontWeight: "600" }}
          >
            Full Name
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isEditing ? (
              <Box sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(storedName);
                      setError("");
                    }}
                    sx={{ textTransform: "none" }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    disabled={!editedName.trim() || isLoading}
                    sx={{ textTransform: "none" }}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="body1">{editedName}</Typography>
                <Button
                  onClick={() => setIsEditing(true)}
                  sx={{
                    minWidth: 0,
                    padding: 0.5,
                    "&:hover": {
                      background: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <Edit fontSize="small" />
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProfileModal;
