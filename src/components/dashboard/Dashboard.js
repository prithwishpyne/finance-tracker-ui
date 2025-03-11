import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { supabase } from "../../supabaseClient";
import Transactions from "../transactions/Transactions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netWorth: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    monthlyData: [],
    expensesByCategory: [],
  });

  const calculateDashboardData = (transactions) => {
    const totalIncome = transactions
      .filter((t) => t.transaction_type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.transaction_type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAssets = transactions
      .filter(
        (t) =>
          t.transaction_type === "income" &&
          t.transaction_category === "Investment"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const totalLiabilities = transactions
      .filter(
        (t) =>
          t.transaction_type === "expense" && t.transaction_category === "Debt"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const netWorth = totalAssets - totalLiabilities;

    // Calculate monthly data
    const monthlyData = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString("default", {
        month: "short",
      });
      const existingMonth = acc.find((m) => m.month === month);

      if (existingMonth) {
        if (t.transaction_type === "income") existingMonth.income += t.amount;
        else existingMonth.expenses += t.amount;
      } else {
        acc.push({
          month,
          income: t.transaction_type === "income" ? t.amount : 0,
          expenses: t.transaction_type === "expense" ? t.amount : 0,
        });
      }
      return acc;
    }, []);

    // Calculate expenses by category
    const expensesByCategory = transactions
      .filter((t) => t.transaction_type === "expense")
      .reduce((acc, t) => {
        const existingCategory = acc.find(
          (c) => c.category === t.transaction_category
        );
        if (existingCategory) {
          existingCategory.amount += t.amount;
        } else {
          acc.push({ category: t.transaction_category, amount: t.amount });
        }
        return acc;
      }, []);

    setDashboardData({
      totalIncome,
      totalExpenses,
      netWorth,
      totalAssets,
      totalLiabilities,
      monthlyData,
      expensesByCategory,
    });
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // User is authenticated through Google
          const { user } = session;
          setUserName(user.user_metadata.full_name || user.email);
        } else {
          // User is authenticated through traditional login
          const storedName = localStorage.getItem("userName");
          if (storedName) {
            setUserName(storedName);
          }
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, []);

  const handleTransactionUpdate = (newTransactions) => {
    setTransactions(newTransactions);
    calculateDashboardData(newTransactions);
  };

  return (
    <div className={styles.dashboard}>
      {userName && (
        <div className={styles.welcome}>
          <h2>Welcome, {userName}</h2>
          <div className={styles.netWorth}>
            Net Worth:{" "}
            {dashboardData.netWorth.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      )}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h3>Total Income</h3>
          <p className={styles.amount}>
            {dashboardData.totalIncome.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className={styles.card}>
          <h3>Total Expenses</h3>
          <p className={styles.amount}>
            {dashboardData.totalExpenses.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className={styles.card}>
          <h3>Total Assets</h3>
          <p className={styles.amount}>
            {dashboardData.totalAssets.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className={styles.card}>
          <h3>Total Liabilities</h3>
          <p className={styles.amount}>
            {dashboardData.totalLiabilities.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartContainer}>
          <h3>Income vs Expenses (Last 6 months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#8884d8" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartContainer}>
          <h3>Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.expensesByCategory}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {dashboardData.expensesByCategory.map((entry) => {
                  const categoryColors = {
                    Rent: "#FF6384",
                    Food: "#36A2EB",
                    Utilities: "#FFCE56",
                    Transport: "#4BC0C0",
                    Entertainment: "#9966FF",
                    Healthcare: "#FF9F40",
                    Shopping: "#C9CBCF",
                    Other: "#FF7F50",
                  };
                  return (
                    <Cell
                      key={`cell-${entry.category}`}
                      fill={categoryColors[entry.category]}
                    />
                  );
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Transactions onTransactionUpdate={handleTransactionUpdate} />
    </div>
  );
};

export default Dashboard;
