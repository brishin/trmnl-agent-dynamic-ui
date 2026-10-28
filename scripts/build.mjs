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
const wx=JSON.parse(read('src/design/weather.json'));
const wxNames=Object.keys(wx.conditions),wxList=k=>`'${wxNames.map(n=>wx.conditions[n][k]).join(',')}' | split: ','`;
const wxTables=`{% assign wx_names = '${wxNames.join(',')}' | split: ',' %}{% assign wx_files = ${wxList('icon')} %}{% assign wx_shades = ${wxList('shade')} %}`;
const wxFind=(v,body)=>`{% for c in wx_names %}{% if c == ${v} %}${body}{% endif %}{% endfor %}`;
// Icons load from the URLs the Weather Glance plugin used; vendor/weather-icons pins the same files for offline tests.
const wxImg=(v,cls)=>`{% assign wxf = 'na' %}${wxFind(v,'{% assign wxf = wx_files[forloop.index0] %}')}<img class="${cls}" src="${wx.icon_url.replace('{icon}','{{ wxf }}')}" alt="">`;
const wxShade=v=>`{% assign shade = 75 %}${wxFind(v,'{% assign shade = wx_shades[forloop.index0] | plus: 0 %}')}`;
const template=name=>read(name).replaceAll('@@COLUMN_PART@@',read('src/templates/column-part.liquid')).replace('/* DESIGN_TOKENS */\n',css).replace('@@WX_TABLES@@',wxTables).replace(/@@WX\(([\w.]+)\|([^)]+)\)@@/g,(_,v,cls)=>wxImg(v,cls)).replace(/@@WX_SHADE\(([\w.]+)\)@@/g,(_,v)=>wxShade(v)).replaceAll('@@RANGE_LEVEL_CASE@@','{% case p.level %}'+wx.range_levels.map((v,i)=>`{% when ${i} %}{% assign shade = ${v} %}`).join('')+`{% else %}{% assign shade = ${wx.range_levels[0]} %}{% endcase %}`).replaceAll('@@INVERSE_AT_OR_BELOW@@',t.ink.fills.inverse_at_or_below);
const schema=JSON.parse(read('src/schemas/v2.json'));
if(schema.definitions.condition.enum.join()!==Object.keys(wx.conditions).join())throw Error('Schema conditions differ from src/design/weather.json');delete schema.title;delete schema.$schema;
const fit=JSON.parse(read('src/design/columns.json'));delete fit.source;
const extra={ordered_types:shapes,columns_fit:fit,columns_fit_rule:'per column of n: inner=row_px/n-column_inset_px. Leaf parts are checked at a width w: the column inner, or in a row of k items its share (inner-row_gap_px*(k-1))/k. At w: body chars=floor(w/glyph_px.body), words wrap whole, inline icon takes icon_px.inline; metric value(+icon_px.value), badge(+16), range text (low–high+unit) must fit w by glyph_px. Leaf height: text lines*line; event (time+text lines)*line; metric metric_value+lines*line; list items wrap at chars-1; badge badge-part; range line+bar. Column height=label+(value or icon?value)+per part: part+leaf height; row part+max(item heights)+baseline when align=baseline; spacer 0. height<=height_px[layout]; label and value(+icon) fit inner; at most one highlight; range low<=high',max_webhook_envelope_utf8_bytes:5000,webhook_envelope:{merge_variables:'SCREEN'},equal_table_row_header_lengths:true,spotlight_first_value_max_chars:3,scoreboard_first_four_values_max_chars:4,focus_first_title_max_chars:24,month_today_and_marked_within_days_in_month:true,almanac_max_dates:3,almanac_first_title_max_chars:18,weekahead_brief_title_max_chars:24,weekahead_brief_text_max_chars:120,countdown_brief_text_max_chars:120,outlook_trend_brief_title_max_chars:24,outlook_trend_brief_text_max_chars:120,forecast_point_mode_low_only:true,forecast_range_and_bars_low_lte_high:true,forecast_display_max_chars_after_rounding:3,range_value_display_max_chars:4,condition_wmo_codes:Object.fromEntries(Object.entries(wx.conditions).map(([k,c])=>[k,c.wmo])),month_first_weekday:'1=Monday..7=Sunday'};
const contract=read('src/contract.liquid')
 .replace('@@SCREEN_SCHEMA_JSON@@',JSON.stringify(schema))
 .replace('@@EXTRA_VALIDATION_JSON@@',JSON.stringify(extra))
 .replace('@@DESIGN_TOKENS_JSON@@',JSON.stringify(t));
write('AI-CONTRACT.liquid',contract);
const full=contract+'{% if schema_version == 2 %}\n'+template('src/templates/v2.liquid')+'\n{% else %}\n'+template('src/templates/v1.liquid')+'\n{% endif %}\n';
// writeMarkup rejected an 85 kB upload with HTTP 413; keep a margin below it.
if(Buffer.byteLength(full)>60000)throw Error('dist/full.liquid is '+Buffer.byteLength(full)+' bytes; keep it under 60000 for writeMarkup');
write('full.liquid',full);
console.log('Built shared tokens and installed renderer.');
