import React, { useState, useEffect } from "react";
import styles from "./Transactions.module.css";
import TransactionModal from "./TransactionModal";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axiosInstance from "../../utils/axiosConfig";

const Transactions = ({ onTransactionUpdate }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  console.log(isLoading);
  const [error, setError] = useState("");
  console.log(error);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get("/transactions/");
      setTransactions(data);
      onTransactionUpdate?.(data);
    } catch (err) {
      setError("Failed to load transactions");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  });

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/transactions/${id}`);
      // Refresh transactions after successful deletion
      await fetchTransactions();
    } catch (err) {
      setError("Failed to delete transaction");
      console.error("Error:", err);
    }
  };

  const handleModalSubmit = async (formData) => {
    setError("");
    setIsLoading(true);

    try {
      await axiosInstance.post("/transactions/", formData);
      await fetchTransactions();
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to create transaction");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <div className={styles.transactionList}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2>Recent Transactions</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              m: 0,
            }}
          >
            Add New Transaction
          </Button>
        </div>
        <div className={styles.transactionHeader}>
          <div className={styles.headerDate}>Date</div>
          <div className={styles.headerDescription}>Description</div>
          <div className={styles.headerType}>Type</div>
          <div className={styles.headerCategory}>Category</div>
          <div className={styles.headerAmount}>Amount</div>
          <div className={styles.headerActions}>Actions</div>
        </div>
        {transactions.slice(-5).map((transaction) => (
          <div
            key={transaction.id}
            className={`${styles.transaction} ${
              styles[transaction.transaction_type]
            }`}
          >
            <div className={styles.transactionDate}>
              {new Date(transaction.date).toLocaleDateString()}
            </div>
            <div className={styles.transactionDescription}>
              {transaction.description}
            </div>
            <div className={styles.transactionType}>
              {transaction.transaction_type.charAt(0).toUpperCase() +
                transaction.transaction_type.slice(1)}
            </div>
            <div className={styles.transactionCategory}>
              {transaction.transaction_category}
            </div>
            <div className={styles.transactionAmount}>
              {transaction.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className={styles.transactionActions}>
              <button
                onClick={() => handleDelete(transaction.id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
