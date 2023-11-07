export function makeWebsocketUrl(endpoint: string) {
  if (!endpoint.startsWith('https://')) {
    throw new Error(`unsupported URL: ${endpoint}`);
  }

  return endpoint.replace(/^https:/, 'wss:');
}
