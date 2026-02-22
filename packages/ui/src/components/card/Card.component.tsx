"use client";

import React from "react";
import clsx from "clsx";
import styles from "./Card.module.scss";

export type CardTone = "surface" | "glass";
export type CardPadding = "sm" | "md" | "lg";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
  padding?: CardPadding;
  inlay?: boolean; // gold border effect
};

export function Card({ tone = "surface", padding = "md", inlay = true, className, children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={clsx(styles.card, styles[`tone_${tone}`], styles[`pad_${padding}`], inlay && styles.inlay, className)}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={clsx(styles.header, className)} />;
}

export function CardBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={clsx(styles.body, className)} />;
}

export function CardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={clsx(styles.footer, className)} />;
}
