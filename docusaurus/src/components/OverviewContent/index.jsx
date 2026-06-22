import { overviewHtml, meta } from '@site/src/generated/overview';
import styles from './styles.module.css';

export default function OverviewContent() {
  return (
    <article className={styles.prose}>
      <p className={styles.badge}>
        Docusaurus preview · {meta.operationCount} методов · {meta.tagCount} разделов
      </p>
      <div dangerouslySetInnerHTML={{ __html: overviewHtml }} />
      <p>
        <a className={styles.button} href="/reference">
          Открыть API Reference →
        </a>
      </p>
    </article>
  );
}
