// Email template utilities
export function getOrganizationName(contestNameShort: string): string {
  return contestNameShort === "IKMC" ? "Innovative Learning" : "Inventive Learning";
}

export function getEmailSignature(contestNameShort: string): string {
  const orgName = getOrganizationName(contestNameShort);
  
  return `
    <p>Best Regards</p>
    <p><b>Team ${contestNameShort}</b></p>
    <p>${orgName}</p>
    <p><b>Office: </b> 042-37180505 | 042-37180506</p>
    <p><b>Whatsapp: </b>0333-2111399 | 0321-8403033 | 0319-5080077</p>
    <p><b>Address: </b>1st Floor, Plaza 114, Main Boulevard, Phase 6, D.H.A Lahore</p>
    <a href="www.kangaroopakistan.org" target="#">www.kangaroopakistan.org</a>
  `;
}