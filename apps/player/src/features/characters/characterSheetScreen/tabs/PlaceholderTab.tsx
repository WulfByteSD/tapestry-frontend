import { Card, CardBody, CardHeader } from "@tapestry/ui";
import styles from "./PlaceholderTab.module.scss";

type Props = {
  title: string;
};

export function PlaceholderTab({ title }: Props) {
  return (
    <Card inlay className={styles.card}>
      <CardHeader className={styles.cardHeader}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.cardHint}>We'll build this section next.</div>
      </CardHeader>
      <CardBody className={styles.muted}>Placeholder for {title.toLowerCase()}.</CardBody>
    </Card>
  );
}
