import * as esbuild from 'esbuild-wasm';
import ReactDOM from "react-dom";
import {useState, useEffect, useRef} from "react";
import {unpkgPathPlugin} from "./bundler/plugins/unpkg-path-plugin";
import {fetchPlugin} from "./bundler/plugins/fetch-plugin";

const App = () => {
    const ref = useRef<any>();
    const iframe = useRef<any>();
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');

    const startService = async () => {
        ref.current = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
        });
    };

    useEffect(() => {
        startService();
    }, []);

    let error: any;
    let result: any;
    const onClick = async () => {
        if (!ref.current) {
            return;
        }
        try {
            result = await ref.current.build({
                entryPoints: ['index.js'],
                bundle: true,
                write: false,
                // minify: true,
                sourcemap: true,
                color: true,
                plugins: [
                    unpkgPathPlugin(),
                    fetchPlugin(input)
                ],
                define: {
                    'process.env.NODE_ENV': '"production"',
                    global: 'window'
                }
            });
        } catch(e: any) {
            console.log("esbuild error", e.message);
            error = e;
            iframe.current.contentWindow.postMessage(error, '*');

        }

        if (error) {
            iframe.current.contentWindow.postMessage(error, '*');
        } else {
            iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
        }
    };

    const htmlDoc = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) => {
            try {
                eval(event.data);
                } catch (err) {
                    console.log('err', err);
                }
          }, false);
        </script>
      </body>
    </html>
    `;

    return <div>
        <textarea value={input} onChange={e => setInput(e.target.value)}></textarea>
        <div>
            <button onClick={onClick}>Submit</button>
        </div>
        <iframe ref={iframe} srcDoc={htmlDoc} sandbox="allow-scripts"/>
    </div>
};


ReactDOM.render(
    <App/>,
    document.querySelector('#root')
)