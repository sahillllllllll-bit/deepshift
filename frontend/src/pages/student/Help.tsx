import React from "react";

const Help: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Contact Us</h1>

      {/* Contact Information */}
      <section style={styles.section}>
        <h2 style={styles.subHeading}>Get in Touch</h2>

        <p style={styles.text}>
          <strong>Email:</strong>{" "}
          <a href="mailto:chillpilltrio.business@gmail.com" style={styles.link}>
       chillpilltrio.business@gmail.com
          </a>
        </p>

        <p style={styles.text}>
          <strong>Contact Number:</strong>{" "}
          <a href="tel:+918081434889" style={styles.link}>
            +91 80001 23456
          </a>
        </p>
      </section>

      {/* Payments / Prizes Section */}
      <section style={styles.section}>
        <h2 style={styles.subHeading}>Payments & Prizes</h2>

        <p style={styles.text}>
          If you secure a rank where prizes are assigned in any DeepShift
          contest, the DeepShift team will contact you via your registered
          email address or contact number within <strong>24 hours</strong>.
        </p>

        <p style={styles.text}>
          Our team will guide you through the prize verification and payment
          process to ensure a smooth and secure experience.
        </p>
      </section>

      {/* Refunds Section */}
      <section style={styles.section}>
        <h2 style={styles.subHeading}>Refunds Policy</h2>

        <p style={styles.text}>
          If you have registered for a contest but did not participate or
          submit an entry, you will <strong>not</strong> be eligible for a
          refund.
        </p>

        <p style={styles.text}>
          Contest registration fees are non-refundable once the contest has
          started, as resources, infrastructure, and administrative efforts
          are allocated in advance.
        </p>

        <p style={styles.text}>
          Refunds may only be considered in exceptional cases such as technical
          failures from the platform side or contest cancellation by DeepShift.
          Any such decision will be at the sole discretion of the DeepShift
          team.
        </p>
      </section>

       <p style={styles.text}>
    <h1>Prizes and Rewards</h1>
    Prize distribution is based on rankings and overall contest performance. The total prize pool and rewards are not fixed and may vary depending on the number of participants and overall contest scale.

     <h1>Final Authority</h1>
    All decisions made by the DeepShift team regarding rankings, disqualifications, and prizes are final and binding.
    </p>

      {/* About DeepShift */}
      <section style={styles.section}>
        <h2 style={styles.subHeading}>About DeepShift</h2>

        <p style={styles.text}>
          DeepShift is a competitive contest platform designed to challenge
          innovators, developers, and problem-solvers through engaging and
          skill-based competitions.
        </p>

        <p style={styles.text}>
          Participate in DeepShift contests to showcase your talent, climb
          the leaderboard, and stand a chance to win exciting prizes, cash
          rewards, and exclusive goodies.
        </p>

        <p style={styles.text}>
          Join our growing community and push your limits while competing
          with top performers across diverse challenges.
        </p>
      </section>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "Arial, Helvetica, sans-serif",
    lineHeight: 1.6,
  },
  heading: {
    fontSize: "32px",
    marginBottom: "20px",
    textAlign: "center",
  },
  subHeading: {
    fontSize: "22px",
    marginBottom: "10px",
  },
  section: {
    marginBottom: "30px",
  },
  text: {
    fontSize: "16px",
    marginBottom: "10px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};

export default Help;
