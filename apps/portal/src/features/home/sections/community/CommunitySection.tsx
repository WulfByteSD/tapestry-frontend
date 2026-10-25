import Image from 'next/image';
import { FiArrowUpRight } from 'react-icons/fi';
import { communityCta } from './CommunitySection.data';
import styles from './CommunitySection.module.scss';

export function CommunitySection() {
  return (
    <section id="community" className={styles.section} aria-labelledby="community-title">
      <Image src={communityCta.logoSrc} alt="" width={88} height={88} className={styles.mark} />
      <div className={styles.copy}>
        <p className={styles.kicker}>The story is still being woven</p>
        <h2 id="community-title">Pull up a chair.</h2>
        <p>Follow new releases, share your table’s stories, and help shape what Tapestry becomes.</p>
      </div>
      <a className={styles.action} href={communityCta.actions[0].href} target="_blank" rel="noreferrer">Join the Discord <FiArrowUpRight aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a>
    </section>
  );
}
