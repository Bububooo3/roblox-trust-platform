export function NotFoundPage({ details }: { details: React.ReactNode }) {
  return (
    <>
      <h1 style={{color: 'red'}}>Error 404</h1>
      <hr />
      <h2>PAGE NOT FOUND</h2>
      <hr />
      <div style={{border: '2px solid black', padding: '20px', backgroundColor: 'yellow'}}>
        <h4>Details:</h4>
        <p>{details}</p>
      </div>
    </>
  );
}
