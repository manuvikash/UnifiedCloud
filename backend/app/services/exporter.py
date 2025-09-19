import os
import subprocess
import tempfile
from typing import List

from app.config import QODO_BIN, QODO_TIMEOUT_S
from app.utils.zipper import zip_dir_to_bytes  # ✅ correct module
from app.utils.parse import parse_component_line


# fix import name (typo safeguard)
from app.utils.zipper import zip_dir_to_bytes as _zip_dir_to_bytes

def _aws_only(components: List[str]) -> List[str]:
    """Filter only AWS components for Terraform demo."""
    aws_lines = []
    for line in components:
        try:
            _, provider, ctype, mods, meta = parse_component_line(line)
            if provider == "aws" or ctype in ("s3:static",):
                aws_lines.append(line)
        except Exception:
            continue
    return aws_lines

def build_qodo_prompt(components: List[str], connections: List[str]) -> str:
    """
    Tell Qodo to write Terraform that matches our minimal component set.
    We keep it simple (S3, CloudFront, ALB, ECS Service, RDS Postgres).
    """
    lines = ["Generate valid Terraform (>=1.5) for AWS based on these components:"]
    for c in components:
        lines.append(f"- {c}")
    if connections:
        lines.append("Connections:")
        for c in connections:
            lines.append(f"- {c}")

    lines.append("""
Write minimal, plan-ready HCL. Use these files and paths relative to CWD:
- ./export/main.tf
- ./export/variables.tf

Constraints:
- Only include resources for AWS components you recognize (ALB, ECS/Fargate service, RDS Postgres, S3 static website, CloudFront).
- Use variable 'region' where needed.
- Do not include placeholders other than variables.
- If some components are non-AWS (e.g., Cloudflare, Supabase), ignore them (they are managed outside Terraform for this demo).
""")
    return "\n".join(lines).strip()

def generate_zip(components: List[str], connections: List[str]) -> bytes:
    # Filter to AWS-only lines for IaC generation
    aws_components = _aws_only(components)

    with tempfile.TemporaryDirectory() as td:
        prompt = build_qodo_prompt(aws_components, connections)
        cmd = [
            QODO_BIN,
            "gen",
            "--yes",  # auto-approve all prompts
            "--ci",  # non-interactive / CI mode
            "--tool", "filesystem",
            "--prompt", prompt,
        ]

        # Run Qodo CLI in temp dir so it writes to ./export
        subprocess.run(cmd, cwd=td, check=True, timeout=QODO_TIMEOUT_S)

        export_dir = os.path.join(td, "export")
        if not os.path.isdir(export_dir):
            # Some agents may write at CWD; zip everything
            export_dir = td

        return zip_dir_to_bytes(export_dir)
