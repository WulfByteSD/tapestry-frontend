import styles from "./Dashboard.module.scss";

const summaryCards = [
  {
    title: "Authentication",
    copy: "Protected routes now require a valid admin session before any shell UI is rendered.",
  },
  {
    title: "Profile enforcement",
    copy: "Users without a resolvable admin profile are logged out and returned to the admin login screen.",
  },
  {
    title: "Shell structure",
    copy: "Sidebar navigation and header chrome are isolated to authenticated admin routes only.",
  },
];

export default function DashboardView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Dashboard</p>
        <h1 className={styles.title}>Admin foundation is live</h1>
        <p className={styles.subtitle}>
          Authentication, admin-profile enforcement, and the protected shell are in place. This landing page can now
          evolve into the real storyweaver dashboard without rebuilding the session flow later.
        </p>
      </section>

      <section className={styles.grid}>
        {summaryCards.map((card) => (
          <article key={card.title} className={styles.card}>
            <h2>{card.title}</h2>
            <p>{card.copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
