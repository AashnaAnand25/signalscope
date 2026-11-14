"""Run Graphify's deterministic source extraction; no LLM key required.
Install: python -m pip install graphifyy==0.9.108
Run from repository root: python scripts/code-graph.py
"""
import shutil
import subprocess
from pathlib import Path
root = Path(__file__).resolve().parent.parent
subprocess.run(["graphify", "update", "src", "--no-cluster"], cwd=root, check=True)
subprocess.run(["graphify", "cluster-only", "src", "--no-label"], cwd=root, check=True)
output = root / "graphify-out"
output.mkdir(exist_ok=True)
for name in ("graph.json", "graph.html", "GRAPH_REPORT.md"):
    shutil.copy2(root / "src" / "graphify-out" / name, output / name)
shutil.rmtree(root / "src" / "graphify-out")
print("Graph written to graphify-out/graph.html, graph.json and GRAPH_REPORT.md")
