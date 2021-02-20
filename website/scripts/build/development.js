require('esbuild').build({
  entryPoints: ['app.jsx'],
  bundle: true,
  minify: false,
  sourcemap: true,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outfile: 'dist/out.js',
  define: {
    'process.env.NODE_ENV': '"development"',
  },
}).catch(() => process.exit(1))
