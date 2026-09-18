export function projectProgress(tasks = []) {
  if (!tasks.length) return 0;
  return Math.round(tasks.filter((task) => task.done).length / tasks.length * 100);
}
export function invoiceTotal(items = [], taxPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
  return { subtotal, tax: subtotal * Number(taxPercent || 0) / 100, total: subtotal * (1 + Number(taxPercent || 0) / 100) };
}
export function monthlyRevenue(invoices = []) {
  return invoices.filter((invoice) => invoice.status === 'Paid').reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
}
export function generateProposal({ client, project, service, timeline, price }) {
  return `Hi ${client || 'there'},\n\nI’d love to help with ${project || 'your project'}. I will deliver ${service || 'a polished, reliable solution'} with clear milestones, responsive communication, and a final quality check.\n\nTimeline: ${timeline || 'To be agreed'}\nInvestment: PKR ${Number(price || 0).toLocaleString('en-PK')}\n\nIf this fits your goals, I can begin with a short discovery call and a written action plan.\n\nBest,\nFazeel`;
}
