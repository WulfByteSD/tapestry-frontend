import Image from 'next/image';
import Link from 'next/link';
import styles from './BrandMark.module.scss';

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
  showTagline?: boolean;
  preserveTaglineOnMobile?: boolean;
  tabIndex?: number;
};

export function BrandMark({ compact = false, className, showTagline = true, preserveTaglineOnMobile = false, tabIndex }: BrandMarkProps) {
  const brandClassName = [styles.brand, compact ? styles.compact : '', preserveTaglineOnMobile ? styles.preserveTaglineOnMobile : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <Link href="/" className={brandClassName} aria-label="Tapestry home" tabIndex={tabIndex}>
      {/* <span className={styles.sigil} aria-hidden="true">
        <Image
          src="https://res.cloudinary.com/dmc7wmarf/image/upload/v1771775270/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_bcpc4f.png"
          alt="Tapestry Logo"
          width={150}
          height={150}
          className={styles.logoImage}
        />
      </span> */}
      <span className={styles.copy}>
        <span className={styles.title}>Tapestry</span>
        {showTagline ? <span className={styles.tagline}>Stories woven through the Threads of Fate</span> : null}
      </span>
    </Link>
  );
}
