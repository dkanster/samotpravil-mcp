// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'СамОтправил API',
  tagline: 'Документация SMTP API сервиса СамОтправил',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: process.env.DOCUSAURUS_URL ?? 'http://localhost:3000',
  baseUrl: process.env.DOCUSAURUS_BASE_URL ?? '/',

  organizationName: 'dkanster',
  projectName: 'samotpravil-mcp',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'СамОтправил API',
        logo: {
          alt: 'СамОтправил',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Документация',
          },
          {
            to: '/reference',
            label: 'API Reference',
            position: 'left',
          },
          {
            href: 'https://samotpravil.ru/get-access',
            label: 'Получить доступ',
            position: 'right',
          },
          {
            href: 'https://github.com/dkanster/samotpravil-mcp',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Документация',
            items: [
              { label: 'Обзор', to: '/' },
              { label: 'API Reference', to: '/reference' },
            ],
          },
          {
            title: 'СамОтправил',
            items: [
              { label: 'Сайт', href: 'https://samotpravil.ru/' },
              { label: 'Получить доступ', href: 'https://samotpravil.ru/get-access' },
            ],
          },
          {
            title: 'Репозиторий',
            items: [
              { label: 'samotpravil-mcp', href: 'https://github.com/dkanster/samotpravil-mcp' },
              { label: 'npm', href: 'https://www.npmjs.com/package/samotpravil-mcp' },
            ],
          },
        ],
        copyright: `Статический preview из Postman snapshot · ${new Date().getFullYear()} · samotpravil-mcp`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
