import React from "react";

const Chatbot: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Chatbot</h1>
        <h2 style={styles.comingSoon}>Coming Soon</h2>

        <p style={styles.description}>
          We are building an intelligent assistant to help you navigate
          DeepShift contests, rules, rankings, and platform features with ease.
        </p>

        <div style={styles.features}>
          <h3 style={styles.featuresTitle}>What to Expect</h3>
          <ul style={styles.list}>
            <li>Instant answers to contest-related questions</li>
            <li>Guidance on registrations, submissions, and rankings</li>
            <li>Support for payments, prizes, and refunds</li>
            <li>Personalized assistance for participants</li>
          </ul>
        </div>

        <p style={styles.footerText}>
          The chatbot is currently under development and will be available
          soon to enhance your experience on the DeepShift platform.
        </p>

        <div style={styles.badge}>Under Development</div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // background:
    //   "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
    padding: "20px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  card: {
    backgroundColor: "#020617",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "40px",
    maxWidth: "600px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontSize: "36px",
    marginBottom: "10px",
    color: "#e5e7eb",
  },
  comingSoon: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#38bdf8",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  description: {
    fontSize: "16px",
    color: "#cbd5f5",
    marginBottom: "30px",
    lineHeight: 1.6,
  },
  features: {
    textAlign: "left",
    marginBottom: "30px",
  },
  featuresTitle: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "#e5e7eb",
  },
  list: {
    paddingLeft: "20px",
    color: "#94a3b8",
    lineHeight: 1.8,
  },
  footerText: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "20px",
  },
  badge: {
    display: "inline-block",
    padding: "8px 16px",
    backgroundColor: "#0ea5e9",
    color: "#020617",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.5px",
  },
};

export default Chatbot;
