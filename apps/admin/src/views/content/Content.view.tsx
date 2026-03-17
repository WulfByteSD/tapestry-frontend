import styles from "./Content.module.scss";

export default function ContentView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Gameplay</p>
        <h1 className={styles.title}>Content</h1>
        <p className={styles.subtitle}>
          This space is ready for the future library editor and content-management workflows.
        </p>
      </section>

      <section className={styles.panel}>
        <h2>Next stop</h2>
        <p>
          Build the content board here once the first authoring flows are ready. The route is already protected by the
          admin shell and profile gate, so future work can stay focused on the editor itself.
        </p>
      </section>
    </div>
  );
}
