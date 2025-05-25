export default function GlobalNotFound() {
  return (
    <html>
      <head>
        <title>404 - Page Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '500px'
        }}>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            margin: '0 0 1rem 0',
            color: '#1f2937'
          }}>
            404
          </h1>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '0 0 1rem 0',
            color: '#374151'
          }}>
            Page not found / Strona nie znaleziona
          </h2>
          <p style={{
            fontSize: '1rem',
            margin: '0 0 2rem 0',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            The page you are looking for was not found. It may have been moved or deleted.
            <br />
            Szukana strona nie została znaleziona. Możliwe, że została przeniesiona lub usunięta.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a 
              href="/pl/blog" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1f2937',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              ← Back to blog / Powrót do bloga
            </a>
            <a 
              href="/pl" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#1f2937',
                textDecoration: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              🏠 Homepage / Strona główna
            </a>
          </div>
        </div>
      </body>
    </html>
  );
} 