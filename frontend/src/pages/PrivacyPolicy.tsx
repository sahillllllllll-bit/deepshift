import React from "react";
import { LandingNavbar } from "@/components/landing-navbar";
import { Footer } from "@/components/footer";

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <LandingNavbar />

      <main style={styles.main}>
        <h1 style={styles.heading}>Privacy Policy</h1>

        <p style={styles.text}>
          DeepShift respects your privacy and is committed to protecting your
          personal information.
        </p>

        <p style={styles.text}>
          We collect only the data required to operate contests, manage user
          accounts, and process payments securely.
        </p>

        <p style={styles.text}>
          Your information is never sold to third parties and is protected
          using industry-standard security practices.
        </p>

 <p style={styles.text}>
    <h1>Prizes and Rewards</h1>
    Prize distribution is based on rankings and overall contest performance. The total prize pool and rewards are not fixed and may vary depending on the number of participants and overall contest scale.

     <h1>Final Authority</h1>
    All decisions made by the DeepShift team regarding rankings, disqualifications, and prizes are final and binding.
    </p>
        <p style={styles.text}>
          By using the DeepShift platform, you agree to this Privacy Policy.
        </p>
      </main>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;

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
