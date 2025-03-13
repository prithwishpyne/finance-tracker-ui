import React from "react";
import { Modal, Box, Typography, Button, TextField, MenuItem } from "@mui/material";
import { Close } from "@mui/icons-material";
import styles from "../transactions/TransactionModal.module.css";
import axiosInstance from "../../utils/axiosConfig";

const LIABILITY_CATEGORIES = [
  "Personal Loans",
  "Credit Card Debt",
  "Mortgage",
  "Car Loans",
  "Student Loans",
  "Other Debts"
];

const LiabilityModal = ({ isOpen, onClose, onSubmit }) => {
  const [category, setCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/assets-liabilities/", {
        type: "Liability",
        category,
        amount: parseInt(amount, 10),
        description,
        date,
      });

      onSubmit(data);
      
      // Reset form
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      onClose();
    } catch (error) {
      console.error("Error adding liability:", error);
      alert("Failed to add liability. Please try again.");
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
            Add Liability
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
            select
            label="Liability Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="">Select a category</MenuItem>
            {LIABILITY_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Amount"
            value={amount}
            onChange={(e) => e.target.value >= 0 && setAmount(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, textTransform: "none" }}
          >
            Add Liability
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default LiabilityModal;