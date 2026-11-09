// Generic redaction rules (D9, ARCHITECTURE §4). Each rule has an id that the scan
// reports together with file:line. The matched text is never printed.

export type Rule = {
  id: string;
  pattern: RegExp;
  // Optional second check on a match, for things a regex can't express well.
  accept?: (match: string) => boolean;
};

const PUBLIC_EMAIL = "hello" + "@" + "patrickdiaz.dev";

function validIPv4(m: string): boolean {
  return m.split(".").every((o) => o.length > 0 && Number(o) <= 255 && !(o.length > 1 && o.startsWith("0")));
}

function plausibleIPv6(m: string): boolean {
  // At least five groups, or a "::" compression with two or more hex groups.
  const groups = m.split(":").filter((g) => g.length > 0);
  if (m.includes("::")) return groups.length >= 2 && groups.every((g) => /^[0-9a-f]{1,4}$/i.test(g));
  return groups.length >= 5;
}

export const RULES: Rule[] = [
  {
    id: "ipv4",
    pattern: /(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.]*\d)/g,
    accept: validIPv4,
  },
  {
    id: "ipv6",
    pattern: /(?<![\w:])[0-9a-f]{0,4}(?::[0-9a-f]{0,4}){2,7}(?![\w:])/gi,
    accept: plausibleIPv6,
  },
  {
    id: "mac-address",
    pattern: /(?<![\w:-])(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}(?![\w:-])/gi,
  },
  {
    id: "private-network-name",
    // Host names under reserved local or internal suffixes. A suffix followed by
    // another dot (like a "settings" file with a second extension) is not a host name.
    pattern: /\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:local|lan|internal|intranet|corp|home\.arpa|localdomain)\b(?![.\w-])/gi,
  },
  {
    id: "url-port",
    pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@"'`<>()]+:\d{2,5}\b|\blocalhost:\d{2,5}\b/gi,
  },
  {
    id: "absolute-path",
    pattern:
      /(?<![\w.:/~-])\/(?:home|Users|root|etc|var|opt|srv|mnt|usr|tmp|private|Volumes|media|data|workspace)\/[\w.\/-]*|(?<![\w/])~\/[\w.\/-]*|\b[a-z]:\\(?:Users|Windows|ProgramData)\\[\w.\\-]*/gi,
  },
  {
    id: "env-file-path",
    // A path to an env file (with a directory part). Bare mentions of the
    // pattern itself, as in .gitignore, are not paths.
    pattern: /[\w.-]+\/\.env(?:\.[\w-]+)?\b/g,
  },
  {
    id: "vm-id",
    pattern: /\b(?:vm[-_ ]?id|qm\s+(?:start|stop|set|config|clone|destroy)|pct\s+(?:start|stop|set|config|enter))\s*[:=#]?\s*\d{3,}\b|\bVM\s+\d{3,9}\b/gi,
  },
  {
    id: "email",
    pattern: /(?<![\w.+-])[\w.+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\b/gi,
    accept: (m) => m.toLowerCase() !== PUBLIC_EMAIL,
  },
  {
    id: "phone-number",
    pattern: /(?<![\w+])\+\d{1,3}[\s.-]?\(?\d{1,4}\)?(?:[\s.-]?\d{2,4}){2,4}\b|\b0\d{2}\s\d{3}\s\d{2}\s\d{2}\b/g,
  },
  {
    id: "uuid",
    pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  },
];

export const RULE_IDS = new Set([...RULES.map((r) => r.id), "deny-list", "gitleaks"]);

export function denyListRule(words: string[]): Rule | undefined {
  const cleaned = words.map((w) => w.trim()).filter((w) => w.length > 0 && !w.startsWith("#"));
  if (cleaned.length === 0) return undefined;
  const escaped = cleaned.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"));
  return {
    id: "deny-list",
    pattern: new RegExp(`(?<![\\p{L}\\p{N}])(?:${escaped.join("|")})(?![\\p{L}\\p{N}])`, "giu"),
  };
}
