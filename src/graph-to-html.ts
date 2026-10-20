import { writeFileSync } from "node:fs";
import type Graph from "./graph.ts";
import type { propKVpairs } from "./edge.ts";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const fmtProps = (props: propKVpairs): string =>
  Object.entries(props)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");

export function graphToHtml(graph: Graph, path = "graph.html", open = true): string {
  const elements = [
    ...graph.nodes().map((n) => ({
      data: {
        id: `n${n.id}`,
        label: [`${n.id}${n.label ? ":" + n.label : ""}`, fmtProps(n.props)].filter(Boolean).join("\n"),
      },
    })),
    ...graph.edges().map((e) => ({
      data: {
        id: `e${e.id}`,
        source: `n${e.from.id}`,
        target: `n${e.to.id}`,
        label: [`[${e.id}]${e.label ? " " + e.label : ""}`, fmtProps(e.props)].filter(Boolean).join("\n"),
      },
    })),
  ];

  // escape "<" so a prop value containing "</script>" can't break the page
  const json = JSON.stringify(elements).replace(/</g, "\\u003c");

  const html = `<!doctype html>
    <meta charset="utf-8">
    <meta name="color-scheme" content="light dark">
    <title>graph</title>
    <style>
    html, body, #cy { height: 100%; margin: 0; }
    body { background: #ffffff; }
    @media (prefers-color-scheme: dark) { body { background: #1e1e1e; } }
    </style>
    <div id="cy"></div>
    <script src="https://cdn.jsdelivr.net/npm/cytoscape@3.30.2/dist/cytoscape.min.js"></script>
    <script>
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const c = dark
    ? { text: "#e6e6e6", nodeBg: "#2d3b55", nodeBorder: "#6ea8ff", edge: "#8a8a8a", labelBg: "#1e1e1e" }
    : { text: "#1a1a1a", nodeBg: "#dbe8ff", nodeBorder: "#4f8ef7", edge: "#999999", labelBg: "#ffffff" };

    cytoscape({
    container: document.getElementById("cy"),
    elements: ${json},
    layout: { name: "cose", animate: false, nodeDimensionsIncludeLabels: true,
                nodeRepulsion: 1000000, idealEdgeLength: 200, padding: 40 },
    style: [
        { selector: "node", style: {
            label: "data(label)", color: c.text, "text-wrap": "wrap", "text-valign": "center",
            shape: "round-rectangle", width: "label", height: "label", padding: "10px",
            "background-color": c.nodeBg, "border-width": 1, "border-color": c.nodeBorder,
            "font-size": 12 } },
        { selector: "edge", style: {
            label: "data(label)", color: c.text, "text-wrap": "wrap",
            "text-background-color": c.labelBg, "text-background-opacity": 1,
            "text-background-padding": "2px",
            "font-size": 10, width: 2, "line-color": c.edge,
            "target-arrow-shape": "triangle", "target-arrow-color": c.edge,
            "curve-style": "bezier", "control-point-step-size": 60 } },
    ],
    });
    </script>`;

  writeFileSync(path, html);
  if (open) openInBrowser(path);
  return path;
}

function openInBrowser(file: string): void {
  const target = resolve(file);
  const [cmd, args] = process.platform === "darwin" ? ["open", [target]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", target]] : ["xdg-open", [target]];

  const child = spawn(cmd, args, { stdio: "ignore", detached: true });
  child.on("error", () => console.error(`Couldn't open a browser, open ${target} manually`));
  child.unref();
}

export default graphToHtml;
