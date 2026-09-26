'use client';

import { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

import styles from './InteractiveBook.module.scss';
import { BookCssVars, InteractiveBookProps } from './InteractiveBook.types';

const bookTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
  mass: 0.8,
} as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function InteractiveBook({
  title,
  coverSrc,
  coverAlt,
  spineSrc,
  spineLabel,
  showSpineLabel = true,
  showMetadata = true,
  eyebrow,
  description,
  expanded = false,
  disabled = false,
  className,
  width = '17rem',
  height = '21rem',
  spineWidth = '3.25rem',
  spineEdgeWidth = '1.08rem',
  coverFit = 'cover',
  coverPosition = 'center',
  spineFit = 'cover',
  spineColor = '#a9822b',
}: InteractiveBookProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isOpen = !disabled && (expanded || isHovered || isFocused);

  const cssVars: BookCssVars = {
    '--book-width': width,
    '--book-height': height,
    '--spine-width': spineWidth,
    '--spine-edge-width': spineEdgeWidth,
    '--cover-fit': coverFit,
    '--cover-position': coverPosition,
    '--spine-fit': spineFit,
    '--spine-color': spineColor,
  };

  const articleVariants: Variants = {
    collapsed: {
      width: spineWidth,
    },
    expanded: {
      width,
    },
  };

  const shellVariants: Variants = {
    collapsed: {
      x: 0,
      y: 0,
      scale: 1,
      filter: 'drop-shadow(0 0.55rem 0.8rem rgba(0, 0, 0, 0.2))',
    },
    expanded: {
      x: shouldReduceMotion ? 0 : 12,
      y: shouldReduceMotion ? 0 : -10,
      scale: shouldReduceMotion ? 1 : 1.015,
      filter: 'drop-shadow(0 1.25rem 1.5rem rgba(0, 0, 0, 0.34))',
    },
  };

  return (
    <motion.article
      className={cx(styles.book, isOpen && styles.isOpen, disabled && styles.disabled, className)}
      style={cssVars}
      aria-label={title}
      tabIndex={disabled ? -1 : 0}
      initial={false}
      animate={isOpen ? 'expanded' : 'collapsed'}
      variants={articleVariants}
      transition={bookTransition}
      layout="position"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <motion.div
        className={styles.stage}
        aria-hidden="true"
        variants={{
          collapsed: { width: spineWidth },
          expanded: { width },
        }}
        transition={bookTransition}
      >
        <motion.div className={styles.bookShell} variants={shellVariants} transition={bookTransition}>
          <div className={styles.pageBlock} />

          <div className={styles.cover}>
            {coverSrc ? <img className={styles.coverImage} src={coverSrc} alt="" draggable={false} /> : <span className={styles.fallbackSigil}>{title.charAt(0)}</span>}
            <span className={styles.coverFrame} />
            <span className={styles.coverShine} />
          </div>

          <motion.div
            className={styles.spine}
            variants={{
              collapsed: { width: spineWidth },
              expanded: { width: spineEdgeWidth },
            }}
            transition={bookTransition}
          >
            {spineSrc ? (
              <motion.img
                className={styles.spineImage}
                src={spineSrc}
                alt=""
                draggable={false}
                variants={{
                  collapsed: { opacity: 1 },
                  expanded: { opacity: 0 },
                }}
                transition={{ duration: 0.16 }}
              />
            ) : null}

            <span className={styles.spineDepth} />
            <span className={styles.spineEdgeLines} />

            {showSpineLabel && (
              <motion.span
                className={styles.spineText}
                variants={{
                  collapsed: { opacity: 1, scale: 1 },
                  expanded: { opacity: 0, scale: 0.86 },
                }}
                transition={{ duration: 0.16 }}
              >
                {spineLabel ?? title}
              </motion.span>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
      {showMetadata && isOpen && (
        <motion.div
          className={styles.copy}
          variants={{
            collapsed: { opacity: 0, y: 10 },
            expanded: { opacity: 1, y: 0 },
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
        > 
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
          {coverAlt ? <span className={styles.srOnly}>{coverAlt}</span> : null}
        </motion.div>
      )}
    </motion.article>
  );
}
