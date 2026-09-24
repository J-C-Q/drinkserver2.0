import { createHash, randomBytes } from "crypto";

// Tokens are only stored as hashes, so a database leak does not expose
// working verification or reset links.
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const createToken = () => randomBytes(32).toString("base64url");
