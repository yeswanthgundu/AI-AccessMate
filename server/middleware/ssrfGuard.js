import dns from "dns/promises";
import net from "net";

// RFC 1918, loopback, link-local, cloud metadata ranges
function isPrivateIp(ip) {
  if (!ip) return true;

  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local / AWS / GCP metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0
    if (parts[0] === 0) return true;
    // Broadcast
    if (parts[0] >= 224) return true;
  }

  // IPv6 checks
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // Loopback
    if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
    // Link local
    if (normalized.startsWith("fe80:")) return true;
    // Unique local
    if (normalized.startsWith("fc00:") || normalized.startsWith("fd00:")) return true;
    // IPv4 mapped
    if (normalized.startsWith("::ffff:")) {
      const ipv4Part = normalized.replace("::ffff:", "");
      return isPrivateIp(ipv4Part);
    }
  }

  return false;
}

export async function validateUrlForSsrf(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch (err) {
    throw new Error("Invalid URL format.");
  }

  // Enforce protocol
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Forbidden protocol: ${parsed.protocol}. Only http and https are permitted.`);
  }

  const hostname = parsed.hostname;
  if (!hostname) {
    throw new Error("URL must include a valid hostname.");
  }

  // Block localhost and standard aliases
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname === "0.0.0.0"
  ) {
    throw new Error("Access to localhost and internal hostnames is prohibited.");
  }

  // If already an IP address
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error(`Access to private/internal IP address (${hostname}) is blocked.`);
    }
    return parsed.href;
  }

  // Resolve DNS to verify it doesn't resolve to private IP
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        throw new Error(
          `Domain ${hostname} resolves to blocked internal address ${record.address}. Request blocked for SSRF prevention.`
        );
      }
    }
  } catch (dnsErr) {
    if (dnsErr.message.includes("blocked")) throw dnsErr;
    throw new Error(`DNS resolution failed for host "${hostname}": ${dnsErr.message}`);
  }

  return parsed.href;
}
