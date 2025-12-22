import React from "react";
import { LandingNavbar } from "@/components/landing-navbar";
import { Footer } from "@/components/footer";

const ContactUs: React.FC = () => {
  return (
    <>
      <LandingNavbar />

      <main style={styles.main}>
        <h1 style={styles.heading}>Contact Us</h1>

        <p style={styles.text}>
          For any queries related to contests, payments, or platform support,
          reach out to us using the information below.
        </p>

        <p style={styles.text}>
          <strong>Email:</strong> support@deepshift.ai
        </p>

        <p style={styles.text}>
          <strong>Contact Number:</strong> +1 234 567 890
        </p>

        <p style={styles.text}>
          Our team typically responds within 24 hours.
        </p>
      </main>

      <Footer />
    </>
  );
};

export default ContactUs;

const styles = {
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
};
