import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { supabase } from "../../supabaseClient";
import Transactions from "../transactions/Transactions";
import AssetModal from "./AssetModal";
import LiabilityModal from "./LiabilityModal";
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
import { Button, Typography, Skeleton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axiosInstance from "../../utils/axiosConfig";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
];

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [assetsLiabilities, setAssetsLiabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netWorth: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    monthlyData: [],
    expensesByCategory: [],
  });

  const fetchAssetsLiabilities = async () => {
    try {
      const { data } = await axiosInstance.get("/assets-liabilities/");
      setAssetsLiabilities(data);

      const totalAssets = data
        .filter((item) => item.type === "Asset")
        .reduce((sum, item) => sum + item.amount, 0);

      const totalLiabilities = data
        .filter((item) => item.type === "Liability")
        .reduce((sum, item) => sum + item.amount, 0);

      setDashboardData((prev) => ({
        ...prev,
        totalAssets,
        totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
      }));
    } catch (error) {
      console.error("Error fetching assets and liabilities:", error);
    } finally {
      setIsLoading(false);
    }
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
  }, [userName]); // Add userName as dependency

  useEffect(() => {
    fetchAssetsLiabilities();
  }, []);

  const handleAssetSubmit = async (formData) => {
    await fetchAssetsLiabilities();
    setShowAssetModal(false);
  };

  const handleLiabilitySubmit = async (formData) => {
    await fetchAssetsLiabilities();
    setShowLiabilityModal(false);
  };

  const calculateDashboardData = (transactions) => {
    const totalIncome = transactions
      .filter((t) => t.transaction_type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.transaction_type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total assets and liabilities from assetsLiabilities state
    const totalAssets = assetsLiabilities
      .filter((item) => item.type === "Asset")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalLiabilities = assetsLiabilities
      .filter((item) => item.type === "Liability")
      .reduce((sum, item) => sum + item.amount, 0);

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
    if (userName) {
      setUserName(userName);
    }
  }, [userName]);

  const handleTransactionUpdate = (newTransactions) => {
    calculateDashboardData(newTransactions);
  };

  return (
    <div className={styles.dashboard}>
      {userName && (
        <div className={styles.welcome}>
          <Typography sx={{ color: "#fff", fontSize: "22px" }}>
            Welcome, {userName}
          </Typography>
          <div className={styles.topContainer}>
            <div className={styles.netWorth}>
              Net Worth:{" "}
              {dashboardData.netWorth.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setShowAssetModal(true)}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#28a745",
                  color: "#fff",
                }}
              >
                Add Assets
              </Button>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setShowLiabilityModal(true)}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  m: 0,
                }}
              >
                Add Liabilities
              </Button>

              <AssetModal
                isOpen={showAssetModal}
                onClose={() => setShowAssetModal(false)}
                onSubmit={handleAssetSubmit}
              />
              <LiabilityModal
                isOpen={showLiabilityModal}
                onClose={() => setShowLiabilityModal(false)}
                onSubmit={handleLiabilitySubmit}
              />
            </div>
          </div>
        </div>
      )}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h3>Total Income</h3>
          {isLoading ? (
            <Skeleton
              variant="text"
              width="80%"
              height={40}
              sx={{ mx: "auto" }}
            />
          ) : (
            <p className={styles.amount}>
              {dashboardData.totalIncome.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
        <div className={styles.card}>
          <h3>Total Expenses</h3>
          {isLoading ? (
            <Skeleton
              variant="text"
              width="80%"
              height={40}
              sx={{ mx: "auto" }}
            />
          ) : (
            <p className={styles.amount}>
              {dashboardData.totalExpenses.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
        <div className={styles.card}>
          <h3>Total Assets</h3>
          {isLoading ? (
            <Skeleton
              variant="text"
              width="80%"
              height={40}
              sx={{ mx: "auto" }}
            />
          ) : (
            <p className={styles.amount}>
              {dashboardData.totalAssets.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
        <div className={styles.card}>
          <h3>Total Liabilities</h3>
          {isLoading ? (
            <Skeleton
              variant="text"
              width="80%"
              height={40}
              sx={{ mx: "auto" }}
            />
          ) : (
            <p className={styles.amount}>
              {dashboardData.totalLiabilities.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartContainer}>
          <div className={styles.chart}>
            <Typography
              variant="h6"
              sx={{ color: "#000", mb: 2, fontWeight: "600" }}
            >
              Income vs Expenses
            </Typography>
            <div
              style={{
                width: "100%",
                height: 300,
              }}
            >
              {dashboardData.monthlyData.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={dashboardData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#4CAF50"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#f44336"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                  }}
                >
                  <Typography>
                    No transaction data available to display
                  </Typography>
                </div>
              )}
            </div>
          </div>
          <div className={styles.chart}>
            <Typography
              variant="h6"
              sx={{ color: "#000", mb: 2, fontWeight: "600" }}
            >
              Expenses by Category
            </Typography>
            <div
              style={{
                width: "100%",
                height: 300,
              }}
            >
              {dashboardData.expensesByCategory.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dashboardData.expensesByCategory}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {dashboardData.expensesByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                  }}
                >
                  <Typography>
                    No transaction data available to display
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Transactions onTransactionUpdate={handleTransactionUpdate} />
    </div>
  );
};

export default Dashboard;
