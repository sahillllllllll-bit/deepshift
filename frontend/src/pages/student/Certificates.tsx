import React from "react";
import { LandingNavbar } from "@/components/landing-navbar";
import { Footer } from "@/components/footer";

const Certificates: React.FC = () => {
  return (
    <>
      {/* <LandingNavbar /> */}

      <main style={styles.main}>
        {/* Coming Soon Section */}
        <section style={styles.card}>
          <h1 style={styles.heading}>Certificates</h1>
          <h2 style={styles.comingSoon}>Coming Soon</h2>

          <p style={styles.text}>
            We are currently working on the certificate feature. Soon, you will
            be able to view, download, and share your participation and
            achievement certificates directly from this page.
          </p>

          <span style={styles.badge}>Under Development</span>
        </section>

        {/* About Us Section */}
        <section style={styles.card}>
          <h2 style={styles.subHeading}>About DeepShift</h2>

          <p style={styles.text}>
            DeepShift is a competitive contest platform built to recognize real
            skills and genuine performance. Our goal is to provide a fair,
            transparent, and challenging environment for participants to test
            their abilities.
          </p>

          <p style={styles.text}>
            Certificates issued by DeepShift will serve as official recognition
            of your participation and achievements in our contests, helping you
            showcase your skills with confidence.
          </p>

          <p style={styles.text}>
            We believe in merit-based rewards, strict rules, and meaningful
            recognition for every serious competitor.
          </p>
        </section>
      </main>

      {/* <Footer /> */}
    </>
  );
};

export default Certificates;

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    minHeight: "100vh",
    padding: "80px 20px",
    // background: "linear-gradient(135deg, #0b061f, #160b3a)",
    color: "#e9d5ff",
    fontFamily: "Arial, Helvetica, sans-serif",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#120a2e",
    border: "1px solid #3b1d6b",
    borderRadius: "14px",
    padding: "40px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
  },
  heading: {
    fontSize: "36px",
    marginBottom: "10px",
    color: "#c084fc",
  },
  subHeading: {
    fontSize: "26px",
    marginBottom: "16px",
    color: "#d8b4fe",
  },
  comingSoon: {
    fontSize: "22px",
    marginBottom: "20px",
    color: "#a78bfa",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  text: {
    fontSize: "16px",
    lineHeight: 1.7,
    marginBottom: "16px",
    color: "#ddd6fe",
  },
  badge: {
    display: "inline-block",
    marginTop: "10px",
    padding: "8px 18px",
    borderRadius: "999px",
    backgroundColor: "#7c3aed",
    color: "#f5f3ff",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.5px",
  },
};
