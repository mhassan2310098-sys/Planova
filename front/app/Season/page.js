"use client";

import { useState } from "react";

const activities = [
  { id: "beach", label: "Beach & Water Sports" },
  { id: "hiking", label: "Hiking & Trekking" },
  { id: "cultural", label: "Cultural Tours" },
  { id: "wildlife", label: "Wildlife Safari" },
  { id: "photography", label: "Photography" },
  { id: "food", label: "Food & Cuisine" },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const travelStyles = [
  "Adventure",
  "Relaxation",
  "Cultural Immersion",
  "Budget Backpacking",
  "Luxury",
  "Family",
  "Solo",
  "Romantic",
];

const budgetRanges = [
  { value: "", label: "Any budget" },
  { value: "0-10000", label: "Under ৳10,000" },
  { value: "10000-25000", label: "৳10,000 – ৳25,000" },
  { value: "25000-50000", label: "৳25,000 – ৳50,000" },
  { value: "50000-100000", label: "৳50,000 – ৳1,00,000" },
  { value: "100000+", label: "৳1,00,000+" },
];

export default function SeasonBasedRecommendations() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  const toggleActivity = (id) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!selectedMonth || !travelStyle || selectedActivities.length === 0) {
      setError("Please fill in all required fields and select at least one activity.");
      return;
    }
    setError("");
    // Handle submission — e.g., router.push or API call
    console.log({ selectedMonth, travelStyle, selectedActivities, budget });
  };

  return (
    <div style={styles.page}>
      {/* Back Link */}
      <div style={styles.backLink}>
        <a href="/dashboard" style={styles.backAnchor}>
          ← BACK TO DASHBOARD
        </a>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>SEASON BASED RECOMMENDATIONS</h1>
        <p style={styles.subtitle}>
          Tell us your preferences and we'll suggest the perfect destinations
        </p>
      </div>

      {/* Form Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>YOUR TRAVEL PREFERENCES</h2>

        {/* Row 1: Month + Travel Style */}
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              WHEN DO YOU WANT TO TRAVEL? <span style={styles.required}>*</span>
            </label>
            <div style={styles.selectWrapper}>
              <span style={styles.calendarIcon}>📅</span>
              <select
                style={styles.selectWithIcon}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Select a month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              TRAVEL STYLE <span style={styles.required}>*</span>
            </label>
            <select
              style={styles.select}
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
            >
              <option value="">Select your travel style</option>
              {travelStyles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Activities */}
        <div style={styles.fieldGroupFull}>
          <label style={styles.label}>
            WHAT ACTIVITIES INTEREST YOU? <span style={styles.required}>*</span>{" "}
            <span style={styles.labelNote}>(SELECT AT LEAST ONE)</span>
          </label>
          <div style={styles.checkboxGrid}>
            {activities.map((activity) => (
              <label key={activity.id} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(activity.id)}
                  onChange={() => toggleActivity(activity.id)}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>{activity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div style={styles.fieldGroupFull}>
          <label style={styles.label}>BUDGET RANGE (BDT)</label>
          <select
            style={styles.select}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            {budgetRanges.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Submit */}
        <button style={styles.submitBtn} onClick={handleSubmit}>
          GET DESTINATION RECOMMENDATIONS
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "0 0 60px 0",
  },
  backLink: {
    padding: "16px 32px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#fff",
  },
  backAnchor: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    textDecoration: "none",
    letterSpacing: "0.05em",
  },
  header: {
    textAlign: "center",
    padding: "48px 16px 32px",
  },
  title: {
    fontSize: "clamp(24px, 5vw, 42px)",
    fontWeight: "800",
    letterSpacing: "0.06em",
    color: "#111827",
    margin: "0 0 12px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#6b7280",
    margin: 0,
  },
  card: {
    maxWidth: "860px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "36px 40px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    color: "#111827",
    marginTop: 0,
    marginBottom: "28px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "28px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "28px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    color: "#374151",
  },
  required: {
    color: "#374151",
  },
  labelNote: {
    fontWeight: "400",
    color: "#6b7280",
  },
  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  calendarIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "14px",
    pointerEvents: "none",
  },
  selectWithIcon: {
    width: "100%",
    padding: "11px 12px 11px 38px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#6b7280",
    backgroundColor: "#fff",
    appearance: "none",
    cursor: "pointer",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#6b7280",
    backgroundColor: "#fff",
    appearance: "none",
    cursor: "pointer",
    outline: "none",
    boxSizing: "border-box",
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "#fff",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#111827",
    cursor: "pointer",
    flexShrink: 0,
  },
  checkboxText: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
  },
  submitBtn: {
    width: "100%",
    padding: "18px",
    backgroundColor: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    cursor: "pointer",
    marginTop: "8px",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "12px",
  },
};
