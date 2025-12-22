import React from "react";
import { LandingNavbar } from "@/components/landing-navbar";
import { Footer } from "@/components/footer";

const TermsAndConditions: React.FC = () => {
  return (
    <>
      <LandingNavbar />

      <main style={styles.main}>
        <h1 style={styles.heading}>Terms & Conditions</h1>

        <p style={styles.text}>
          By accessing or participating in DeepShift contests, you agree to
          comply with the following terms and conditions.
        </p>

        <ul style={styles.list}>
          <li>All contest entries must be original work.</li>
          <li>Registrations are non-transferable.</li>
          <li>DeepShift reserves the right to disqualify rule violations.</li>
          <li>Prize decisions are final and binding.</li>
          <li>Fees are non-refundable unless explicitly stated.</li>
        </ul>

 <p style={styles.text}>
    <h1>Prizes and Rewards</h1>
    Prize distribution is based on rankings and overall contest performance. The total prize pool and rewards are not fixed and may vary depending on the number of participants and overall contest scale.

     <h1>Final Authority</h1>
    All decisions made by the DeepShift team regarding rankings, disqualifications, and prizes are final and binding.
    </p>
        <p style={styles.text}>
          DeepShift may update these terms at any time without prior notice.
        </p>
      </main>

      <Footer />
    </>
  );
};

export default TermsAndConditions;

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
  list: {
    paddingLeft: "22px",
    marginBottom: "24px",
    lineHeight: 1.8,
    color: "#e9d5ff",
  },
};
