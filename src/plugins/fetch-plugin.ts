import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({
    name: 'fileCache'
});

export const fetchPlugin = (inputCode: string) => {
    return {
        name: 'fetch-plugin',
        setup(build: esbuild.PluginBuild) {
            build.onLoad({ filter: /.*/ }, async (args: any) => {
                // // Check cache for requested file and return it if it is.
                const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
                if (cachedResult) return cachedResult;
            });

            // Handle root entry of file 'index.js'
            build.onLoad({ filter: /^index\.js$/ }, () => {
                return {
                    loader: 'jsx',
                    contents: inputCode,
                };
            });

            // Handle CSS imports
            build.onLoad({ filter: /.css$/ }, async (args: any) => {
                const { data, request } = await axios.get(args.path);
                // TODO: This CSS shit is pretty hacky and needs to be refactored to use the esbuild loaders correctly.
                const escapedCss = data
                    .replace(/\n/g, '')
                    .replace(/"/g, '\\"')
                    .replace(/'/g, "\\'");

                const result: esbuild.OnLoadResult = {
                    loader: 'css',
                    contents: escapedCss,
                    resolveDir: new URL('./', request.responseURL).pathname
                };
                // If not then fetch it and store it in cache
                await fileCache.setItem(args.path, result);

                return result;
            });


            build.onLoad({ filter: /.*/ }, async (args: any) => {
                const { data, request } = await axios.get(args.path);

                const result: esbuild.OnLoadResult = {
                    loader: 'jsx',
                    contents: data,
                    resolveDir: new URL('./', request.responseURL).pathname
                };
                // If not then fetch it and store it in cache
                await fileCache.setItem(args.path, result);

                return result;

            });

        }
    }
}
