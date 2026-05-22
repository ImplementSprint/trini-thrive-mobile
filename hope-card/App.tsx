import { ExpoRoot } from 'expo-router';

export function App() {
  const ctx = (require as any).context('./app');
  return <ExpoRoot context={ctx} />;
}

export default App;
