import fs from 'fs';

try {
    const raw = fs.readFileSync('./lh-report.json', 'utf8');
    const data = JSON.parse(raw);

    const perf = data.categories.performance?.score * 100 || 0;
    const a11y = data.categories.accessibility?.score * 100 || 0;
    const bp = data.categories['best-practices']?.score * 100 || 0;
    const seo = data.categories.seo?.score * 100 || 0;

    console.log("===================================");
    console.log("🚀 LIGHTHOUSE MOBILE AUDIT RATINGS 🚀");
    console.log("===================================");
    console.log(`Performance:    ${perf.toFixed(0)} / 100`);
    console.log(`Accessibility:  ${a11y.toFixed(0)} / 100`);
    console.log(`Best Practices: ${bp.toFixed(0)} / 100`);
    console.log(`SEO:            ${seo.toFixed(0)} / 100`);

    console.log("\nTop Suggestions for Speed:");
    const audits = Object.values(data.audits).filter(a => a.score !== null && a.score < 1 && a.weight > 0).sort((a, b) => a.score - b.score).slice(0, 3);
    for (const a of audits) {
        console.log(` - ${a.title}: ${a.displayValue || 'Requires fix'}`);
    }
} catch (e) {
    console.error("Lighthouse parse error:", e.message);
}
