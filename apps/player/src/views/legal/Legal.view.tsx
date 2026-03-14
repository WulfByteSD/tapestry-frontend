import React from "react";
import styles from "./Legal.module.scss";
import parser from "html-react-parser";
import moment from "moment";

const Legal = ({ content }: any) => {
  console.log("Legal content:", content);
  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.header}>{content.title}</div>
        <div className={styles.subHeader}>Effective Date: {moment(content.effective_date).format("MM/DD/YYYY")}</div>
        <p>Version: {content.version}</p>
      </div>
      <div className={styles.contentContainer}>
        {/* <div className={styles.content}>{parser(`${parser(content.content)}`)}</div> */}
        <div className={styles.content}>{parser(content.content)}</div>
      </div>
    </div>
  );
};

export default Legal;
