import packageJson from '../../package.json';

export const environment = {
  production: true,
  product: "retail",
  title: "PROD",
  url: "https://server.buhomanager.com:444/",
  useMultiClient: true,
  nameMultiClient: "tomas",
  appVersion: packageJson.version
};
