export const htmlDoc = `
    <html> 
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) => {
            try {
                eval(event.data);
                } catch (err) {
                    const root = document.querySelector('#root');
                    root.innerHTML = '<div style="color: red"><h4>Runtime Error</h4>' + err + '</div>';
                    console.error(err);
                }
          }, false);
        </script>
      </body>
    </html>
    `;