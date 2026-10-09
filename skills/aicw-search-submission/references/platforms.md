# Work with the website's existing platform

The audit reads output. The agent maps findings back to source files or local CMS records. It does not assume that a common folder layout fits every site.

## HTML

Find the directory that the server actually serves. If HTML is maintained directly, edit it there. If another tool generates it, find the generator and edit its source instead.

Inspect the HTML, root discovery files, metadata, and internal links. Use a local server for response headers, redirects, and browser checks. Preserve path structure and production URLs.

Serialize JSON safely inside a script element. Escape `<` as `\u003c` in JSON text so a value containing `</script>` cannot terminate the element. Do not HTML-entity-encode the JSON body.

## Astro

Inspect `package.json`, the Astro configuration, content collections, layouts, and page components. Use the project's installed version and commands. Do not add a new build tool or change adapters merely to run an audit.

Edit `.astro`, Markdown, MDX, or the existing content source. Keep static content in the server response where practical. Browser hydration is not itself a defect. A hydrated page can already have complete initial HTML.

For JSON-LD, follow an existing helper or safely serialize the data. A typical pattern is:

```astro
---
const data = { '@context': 'https://schema.org', '@type': 'WebPage', name: title };
const json = JSON.stringify(data).replace(/</g, '\\u003c');
---
<script type="application/ld+json" set:html={json} />
```

Run the existing build, then inspect its output directory with `--html-root`. For server-rendered routes, use a running local preview. Do not infer a route from a source filename when the routing configuration says otherwise.

## WordPress

Confirm that the installation and database are local before any write. Inspect environment documentation, `home`, `siteurl`, and the database connection target without printing credentials. A local code checkout can still point to a remote database.

Use a local runtime and supported WordPress APIs or WP-CLI. Inspect the active theme and SEO plugins first. Extend the existing schema generator through its documented configuration or filters. Do not edit WordPress core, a vendor plugin, or serialized database values with text replacement.

For a database-backed edit, follow this sequence:

1. Record the specific post IDs or configuration keys involved and export their current values.
2. Back up the local database outside every web-served directory. For MySQL, use the project's backup tool or `wp --path=/absolute/local/site db export /private/backup/site.sql`.
3. Record the matching restoration command. A MySQL backup from that installation can be restored with `wp --path=/absolute/local/site db import /private/backup/site.sql`.
4. Update the selected record through the WordPress API or WP-CLI. For a post body, `wp --path=/absolute/local/site post update POST_ID /private/new-body.html` reads the new content from a file.
5. Refresh the local page and inspect its response HTML and JSON-LD. Compare the changed records and restore the local backup if the requested result fails.

Treat the example paths and POST_ID as values to replace after discovery. Do not run them against a production target. A local SQLite installation, such as Playground, needs its own consistent database backup method. A stopped runtime or the database's backup API avoids incomplete copies of a live database.

Keep backups out of Git and report exports. Preserve post IDs, slugs, relationships, revisions, and fields unrelated to the requested change. If WP-CLI or the local runtime is unavailable, prepare precise source or content changes and state what remains unverified. Do not claim a database update occurred.

Official references: [WP-CLI commands](https://developer.wordpress.org/cli/commands/), [post update](https://developer.wordpress.org/cli/commands/post/update/), [database export](https://developer.wordpress.org/cli/commands/db/export/).

## Other frameworks

Follow the repository's own build and content conventions. Audit rendered HTML or the supplied local URL. Source inspection can identify likely issues, but dynamic output needs runtime evidence. Do not convert the project to another framework.
