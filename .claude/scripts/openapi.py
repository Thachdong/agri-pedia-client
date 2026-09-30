#!/usr/bin/env python3
"""Token-cheap lookup into specs/openapi.json. Never read the whole spec.

Usage:
  openapi.py list [filter]            # "METHOD /path  operationId  summary"
  openapi.py op METHOD /path          # one operation, $refs resolved, compact
  openapi.py schema Name              # one component schema, $refs resolved
"""
import json
import sys
from pathlib import Path

SPEC = Path(__file__).resolve().parents[2] / "specs" / "openapi.json"
MAX_DEPTH = 6


def load():
    return json.loads(SPEC.read_text())


def resolve(node, spec, depth=0, seen=()):
    if isinstance(node, dict):
        ref = node.get("$ref")
        if ref:
            name = ref.split("/")[-1]
            if name in seen or depth >= MAX_DEPTH:
                return f"<{name}>"
            target = spec["components"]["schemas"][name]
            return {"$schema": name, **resolve(target, spec, depth + 1, seen + (name,))}
        return {k: resolve(v, spec, depth, seen) for k, v in node.items() if k not in ("example", "examples")}
    if isinstance(node, list):
        return [resolve(v, spec, depth, seen) for v in node]
    return node


def fmt_schema(s, indent=0):
    """Render a schema as short TS-like lines."""
    pad = "  " * indent
    if isinstance(s, str):
        return s
    if "enum" in s:
        return " | ".join(json.dumps(v) for v in s["enum"])
    if "oneOf" in s or "anyOf" in s:
        return " | ".join(fmt_schema(x, indent) for x in s.get("oneOf") or s.get("anyOf"))
    if "allOf" in s:
        return " & ".join(fmt_schema(x, indent) for x in s["allOf"])
    t = s.get("type")
    name = s.get("$schema", "")
    if t == "array":
        return f"{fmt_schema(s.get('items', {}), indent)}[]"
    if t == "object" or "properties" in s:
        req = set(s.get("required", []))
        lines = [f"{name + ' ' if name else ''}{{"]
        for k, v in s.get("properties", {}).items():
            opt = "" if k in req else "?"
            nullable = " | null" if isinstance(v, dict) and v.get("nullable") else ""
            rules = constraints(v) if isinstance(v, dict) else ""
            desc = f"  // {v['description']}" if isinstance(v, dict) and v.get("description") else ""
            lines.append(f"{pad}  {k}{opt}: {fmt_schema(v, indent + 1)}{nullable}{rules}{desc}")
        lines.append(f"{pad}}}")
        return "\n".join(lines)
    fmt = f"<{s['format']}>" if s.get("format") else ""
    return f"{t or 'any'}{fmt}"


def constraints(s):
    keys = ("minLength", "maxLength", "minimum", "maximum", "pattern", "minItems", "maxItems", "default")
    got = [f"{k}={s[k]}" for k in keys if k in s]
    return f"  [{', '.join(got)}]" if got else ""


def cmd_list(spec, flt=""):
    for path, ops in spec["paths"].items():
        for method, op in ops.items():
            line = f"{method.upper():6} {path}  {op.get('operationId', '')}  {op.get('summary', '')}"
            if flt.lower() in line.lower():
                print(line)


def cmd_op(spec, method, path):
    op = spec["paths"].get(path, {}).get(method.lower())
    if not op:
        sys.exit(f"Not in spec: {method.upper()} {path} — spec may be stale; run `list` or check ../server.")
    op = resolve(op, spec)
    print(f"{method.upper()} {path}  ({op.get('operationId')})  tags={op.get('tags')}")
    if op.get("security"):
        print("auth: Bearer required")
    if op.get("summary"):
        print(f"summary: {op['summary']}")
    if op.get("description"):
        print(f"description: {op['description']}")
    for p in op.get("parameters", []):
        req = "" if p.get("required") else "?"
        print(f"param {p['in']} {p['name']}{req}: {fmt_schema(p.get('schema', {}))}{constraints(p.get('schema', {}))}"
              + (f"  // {p['description']}" if p.get("description") else ""))
    body = op.get("requestBody", {}).get("content", {})
    for ctype, c in body.items():
        print(f"body ({ctype}): {fmt_schema(c.get('schema', {}))}")
    for status, r in op.get("responses", {}).items():
        content = r.get("content", {})
        schema = next(iter(content.values()), {}).get("schema") if content else None
        head = f"{status} {r.get('description', '')}".rstrip()
        if schema and status.startswith("2"):
            print(f"response {head}: {fmt_schema(schema)}")
        else:
            name = schema.get("$schema", "") if isinstance(schema, dict) else ""
            print(f"response {head}" + (f" <{name}>" if name else ""))


def cmd_schema(spec, name):
    s = spec.get("components", {}).get("schemas", {}).get(name)
    if not s:
        sys.exit(f"No schema {name}")
    print(fmt_schema(resolve({"$ref": f"#/components/schemas/{name}"}, spec)))


if __name__ == "__main__":
    args = sys.argv[1:]
    spec = load()
    if not args or args[0] == "list":
        cmd_list(spec, args[1] if len(args) > 1 else "")
    elif args[0] == "op" and len(args) == 3:
        cmd_op(spec, args[1], args[2])
    elif args[0] == "schema" and len(args) == 2:
        cmd_schema(spec, args[1])
    else:
        sys.exit(__doc__)
