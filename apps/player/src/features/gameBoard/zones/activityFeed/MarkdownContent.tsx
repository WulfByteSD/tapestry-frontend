'use client';

import ReactMarkdown from 'react-markdown';
import styles from './MarkdownContent.module.scss';

type Props = {
  content: string;
};

export function MarkdownContent({ content }: Props) {
  return (
    <div className={styles.markdownContent}>
      <ReactMarkdown
        components={{
          // Customize rendering to fit Tapestry theme
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          // Prevent image embedding for security/simplicity
          img: () => null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
