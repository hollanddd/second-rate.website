require('esbuild').build({
  entryPoints: ['app.jsx'],
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outfile: './dist/outfile.js',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}).catch(() => process.exit(1))
