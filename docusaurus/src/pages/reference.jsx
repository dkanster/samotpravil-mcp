import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import styles from './reference.module.css';

function ScalarReference() {
  const { ApiReferenceReact } = require('@scalar/api-reference-react');
  require('@scalar/api-reference-react/style.css');

  return (
    <div className={styles.reference}>
      <ApiReferenceReact
        configuration={{
          url: '/openapi.yaml',
          theme: 'purple',
          layout: 'modern',
          hideDownloadButton: false,
        }}
      />
    </div>
  );
}

export default function ReferencePage() {
  return (
    <Layout title="API Reference" description="СамОтправил API Reference (OpenAPI)">
      <BrowserOnly fallback={<div className={styles.loading}>Загрузка API Reference…</div>}>
        {() => <ScalarReference />}
      </BrowserOnly>
    </Layout>
  );
}
