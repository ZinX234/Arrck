const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.maxWorkers = 1;
config.resolver.unstable_conditionNames = ['react-native', 'require', 'import', 'default'];

// Stub Node-only modules and OpenTelemetry that get pulled in transitively
// by @supabase/supabase-js + @supabase/realtime-js. None of these are needed
// at runtime in React Native (RN has a native global WebSocket; OTel is
// optional server-side tracing). Without these stubs the Android release
// build dies at the Hermes step on dynamic import() expressions or at the
// Metro resolver on Node built-ins (stream, net, tls).
const NODE_BUILTIN_STUBS = new Set(['ws', 'stream', 'net', 'tls']);
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (NODE_BUILTIN_STUBS.has(moduleName) || moduleName.startsWith('@opentelemetry/')) {
    return { type: 'empty' };
  }
  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;