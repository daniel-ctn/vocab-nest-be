export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "80px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>VocabNest</h1>
      <p>
        Frontend shell for the personal vocabulary app. API calls should go through the centralized
        client in <code>src/lib/api-client.ts</code> and shared schemas from{" "}
        <code>@vocabnest/contracts</code>.
      </p>
    </main>
  );
}
