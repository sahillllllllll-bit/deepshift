import React from "react";
import { LandingNavbar } from "@/components/landing-navbar";
import { Footer } from "@/components/footer";

const HelpCenter: React.FC = () => {
  return (
    <>
      <LandingNavbar />

      <main style={styles.main}>
        <h1 style={styles.heading}>Help Center</h1>

        <p style={styles.text}>
          Welcome to the DeepShift Help Center. Here you can find answers to
          frequently asked questions and guidance on using the platform.
        </p>

        <ul style={styles.list}>
          <li>Contest registration and eligibility</li>
          <li>Submission rules and deadlines</li>
          <li>Ranking and evaluation criteria</li>
          <li>Prizes, payments, and refunds</li>
          <li>Account management and security</li>
        </ul>

        <p style={styles.text}>
          If you require further assistance, please contact our support team.
        </p>
      </main>

      <Footer />
    </>
  );
};

export default HelpCenter;

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    // minHeight: "100vh",
    padding: "80px 20px",
    // background: "linear-gradient(135deg, #0b061f, #160b3a)",
    color: "#e9d5ff",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  heading: {
    fontSize: "34px",
    marginBottom: "24px",
    color: "#c084fc",
  },
  text: {
    fontSize: "16px",
    lineHeight: 1.7,
    marginBottom: "16px",
    color: "#ddd6fe",
  },
  list: {
    paddingLeft: "22px",
    marginBottom: "24px",
    lineHeight: 1.8,
    color: "#e9d5ff",
  },
};
