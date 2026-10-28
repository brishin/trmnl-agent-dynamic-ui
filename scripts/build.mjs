import fs from 'node:fs';
import {shapes} from '../src/validate-v2.mjs';
const root=new URL('../',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const write=(n,s)=>fs.writeFileSync(new URL('dist/'+n,root),s);
fs.mkdirSync(new URL('dist/',root),{recursive:true});
const t=JSON.parse(read('src/design/tokens.json')),ty=t.typography;
const css=`/* Shared readability tokens. Generated from src/design/tokens.json. */
.dui,.agent-screen,.agent-footer {
 --ui-text-min:${ty.minimum_font_size_px}px; --ui-meta-size:${ty.metadata.size}px; --ui-meta-weight:${ty.metadata.weight}; --ui-meta-leading:${ty.metadata.line_height}px;
 --ui-body-size:${ty.body.size}px; --ui-body-weight:${ty.body.weight}; --ui-body-leading:${ty.body.line_height}px;
 --ui-section-size:${ty.section.size}px; --ui-section-weight:${ty.section.weight}; --ui-section-leading:${ty.section.line_height}px;
 --ui-ink:${t.ink.foreground}; --ui-paper:${t.ink.background}; --ui-space:${t.spacing.unit_px}px;
}
`;
write('design-system.css',css);
const template=name=>read(name).replace('/* DESIGN_TOKENS */\n',css);
const schema=JSON.parse(read('src/schemas/v2.json'));delete schema.title;delete schema.$schema;
const extra={ordered_types:shapes,max_webhook_envelope_utf8_bytes:5000,webhook_envelope:{merge_variables:'SCREEN'},equal_table_row_header_lengths:true,spotlight_first_value_max_chars:3,scoreboard_first_four_values_max_chars:4,focus_first_title_max_chars:24,week_max_one_today:true,month_today_and_marked_within_days_in_month:true,almanac_max_dates:3,almanac_first_title_max_chars:18,weekahead_brief_title_max_chars:24,weekahead_brief_text_max_chars:120,countdown_brief_text_max_chars:120,countdown_brief_text_max_chars:120,month_first_weekday:'1=Monday..7=Sunday'};
const contract=read('src/contract.liquid')
 .replace('@@SCREEN_SCHEMA_JSON@@',JSON.stringify(schema))
 .replace('@@EXTRA_VALIDATION_JSON@@',JSON.stringify(extra))
 .replace('@@DESIGN_TOKENS_JSON@@',JSON.stringify(t));
write('AI-CONTRACT.liquid',contract);
write('full.liquid',contract+'{% if schema_version == 2 %}\n'+template('src/templates/v2.liquid')+'\n{% else %}\n'+template('src/templates/v1.liquid')+'\n{% endif %}\n');
console.log('Built shared tokens and installed renderer.');
