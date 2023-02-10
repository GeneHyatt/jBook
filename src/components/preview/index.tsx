import {htmlDoc} from "./html_template";
import React, {useEffect, useRef} from "react";

interface PreviewProps {
    code: string
}


const Preview: React.FC<PreviewProps> = ({code}) => {
    const iframe = useRef<any>();
    useEffect((() => {
        iframe.current.srcdoc = htmlDoc;
        iframe.current.contentWindow.postMessage(code, '*');
    }), [code]);

    return <iframe title="preview" ref={iframe} srcDoc={htmlDoc} sandbox="allow-scripts"/>;
};

export default Preview