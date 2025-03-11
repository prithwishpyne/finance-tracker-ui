import React, { useState, useEffect } from "react";
import styles from "./Transactions.module.css";
import TransactionModal from "./TransactionModal";

const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

const CATEGORIES = {
  [TRANSACTION_TYPES.INCOME]: [
    "Salary",
    "Bonus",
    "Rental",
    "Freelance",
    "Investment",
    "Other",
  ],
  [TRANSACTION_TYPES.EXPENSE]: [
    "Rent",
    "Food",
    "Utilities",
    "Transport",
    "Entertainment",
    "Healthcare",
    "Shopping",
    "Other",
  ],
};

const Transactions = ({ onTransactionUpdate }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/transactions/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
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
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete transaction");

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
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/transactions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create transaction");

      // Refresh transactions after successful creation
      await fetchTransactions();
    } catch (err) {
      setError("Failed to create transaction");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
        Add New Transaction
      </button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <div className={styles.transactionList}>
        <h2>Recent Transactions</h2>
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
