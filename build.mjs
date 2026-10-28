import fs from 'node:fs';
import {shapes} from './v2/validate.mjs';
const root=new URL('./',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const write=(n,s)=>fs.writeFileSync(new URL(n,root),s);
const t=JSON.parse(read('design-system.json')),ty=t.typography;
const css=`/* Shared readability tokens. Generated from design-system.json. */
.dui,.agent-screen,.agent-footer {
 --ui-text-min:${ty.minimum_font_size_px}px; --ui-meta-size:${ty.metadata.size}px; --ui-meta-weight:${ty.metadata.weight}; --ui-meta-leading:${ty.metadata.line_height}px;
 --ui-body-size:${ty.body.size}px; --ui-body-weight:${ty.body.weight}; --ui-body-leading:${ty.body.line_height}px;
 --ui-section-size:${ty.section.size}px; --ui-section-weight:${ty.section.weight}; --ui-section-leading:${ty.section.line_height}px;
 --ui-ink:${t.ink.foreground}; --ui-paper:${t.ink.background}; --ui-space:${t.spacing.unit_px}px;
}
`;
write('design-system.css',css);
for(const name of ['v2/full.liquid','v1.liquid']){
 const source=read(name).replace(/\/\* Shared readability tokens\.[\s\S]*?\n\}\n/,css);
 write(name,source);
}
const schema=JSON.parse(read('v2/screen.schema.json'));delete schema.title;delete schema.$schema;
const contract=`{% comment %}
AGENT_DYNAMIC_UI_CONTRACT/1 plugin_setting_id=522048 size=markup_full preferred_schema=2
MCP: readMarkup({plugin_setting_id:"522048",size:"markup_full"})=>this contract+renderer; getMergeVariables({plugin_setting_id:"522048"})=>current content. Normal updates: updatePluginSettingData({id:"522048",merge_variables:COMPLETE_SCREEN}); send all required top-level keys, not a partial patch. No need to rewrite markup for content/layout selection. Never send this contract/schema as screen data.
SCREEN_SCHEMA_JSON=${JSON.stringify(schema)}
EXTRA_VALIDATION_JSON=${JSON.stringify({ordered_types:shapes,max_webhook_envelope_utf8_bytes:5000,webhook_envelope:{merge_variables:'SCREEN'},equal_table_row_header_lengths:true,spotlight_first_value_max_chars:3,scoreboard_first_four_values_max_chars:4,focus_first_title_max_chars:24})}
V2: width/emphasis optional, accepted for compatibility but ignored; composition fixes geometry/hierarchy. No unknown keys, nulls, HTML/CSS, font knobs or nested Liquid. All strings are content, escaped once; template source is never evaluated from payload strings. Bounds are maxima, not fit guarantees; shorten rather than auto-shrink. Use authorized current facts; do not invent meetings/tasks/metrics; identify sample/unknown data; updated_at=honest human-readable content timestamp, not server refresh time. Prior payload is fictional sample data.
DESIGN_TOKENS_JSON=${JSON.stringify(t)}
DESIGN: black/white; no gray small text; sans Arial/Helvetica, large editorial serif Georgia. V2 decorative bottom footer forbidden; timestamps only in readable top metadata. CSS px>=16 everywhere; px<=16 requires weight>=600; metadata16/700/22, body18/400/26, section18/700/24. Large serif headings may be400. No shrinking below floor. Whitespace/rules/asymmetry group content; avoid repeated cards; spotlight permits one inverse region. Legacy v1 grid retains a readable >=16/700 title bar; no tiny-footer style exists.
VALIDATE locally before push if runtime/files available: node validate.mjs payload.json; npm run test:design (v2/render.mjs)=>Chrome render six compositions, computed text size/weight floor, no .dui-footer, section overflow; npm test=>build+legacy+design. These scripts/schema source live in the local package, NOT callable TRMNL MCP tools; MCP data-write does NOT enforce this custom contract. If unavailable, validate JSON against inline schema+EXTRA_VALIDATION, request server preview, inspect; do not claim local checks ran.
PREVIEW: startPreview({plugin_setting_id:"522048",device_model:"v2",size:"markup_full"})=>job_id; getPreview({plugin_setting_id:"522048",id:job_id})=>status/image; pending=>retry with backoff; complete=>save/display preview_base64 immediately (read consumes result). Local800x480 != device-model proportions; server preview still != physical-screen verification. Do not alter playlist/device settings for routine data pushes. startRefresh({plugin_setting_id:"522048"}) queues rendering; physical display waits for check-in/button. No daily content generator is scheduled by this template.
LEGACY: schema_version=1, no layout; same heading/updated_at/block content fields; width required half|full; optional emphasis normal|important; max4 blocks; slots=0; for b: half=>slots++; full=>slots+=slots%2+2; require slots<=4. Prefer v2. Changing renderer/design: edit source+tokens, node build.mjs, npm test, writeMarkup full.liquid, server-preview. Preserve/regenerate this comment when modifying templates. Source package: outputs/agent-screen/{DESIGN-SYSTEM.md,design-system.json,build.mjs,v2/screen.schema.json,v2/validate.mjs,v2/render.mjs}; local paths are not remote MCP resources. No secrets in this contract.
{% endcomment %}
`;
write('AI-CONTRACT.liquid',contract);
write('full.liquid',contract+'{% if schema_version == 2 %}\n'+read('v2/full.liquid')+'\n{% else %}\n'+read('v1.liquid')+'\n{% endif %}\n');
console.log('Built shared tokens and installed renderer.');
