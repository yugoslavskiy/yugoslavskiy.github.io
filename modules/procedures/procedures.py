import json
import os
from loguru import logger
from modules import util
from . import procedures_config

def generate_procedures():
    """Создает директории и запускает генерацию страницы процедур."""
    util.buildhelpers.create_content_pages_dir()
    util.buildhelpers.move_templates(procedures_config.module_name, procedures_config.procedures_templates_path)

    if not os.path.isdir(procedures_config.procedures_markdown_path):
        os.mkdir(procedures_config.procedures_markdown_path)

    procedures_generated = generate_markdown_files()

    if not procedures_generated:
        util.buildhelpers.remove_module_from_menu(procedures_config.module_name)

def generate_markdown_files():
    has_procedure = False
    from modules import util
    from modules.util.relationshiphelpers import query_all
    from stix2 import Filter
    import re

    srcs = util.relationshipgetters.get_srcs()
    relationships = query_all(srcs, [Filter("type", "=", "relationship"), Filter("relationship_type", "=", "uses"), Filter("revoked", "=", False)])
    procedures_dict = {}

    for rel in relationships:
        if rel.get('x_mitre_deprecated'): continue
        source = target = None
        for src in srcs:
            if not source: source = src.get(rel.source_ref)
            if not target: target = src.get(rel.target_ref)
            if source and target: break

        if not source or not target or target.get('type') != 'attack-pattern': continue
        target_id = util.buildhelpers.get_attack_id(target)
        desc = rel.get('description', '').strip()
        if not target_id or not desc: continue

        key = f"{target_id}_{desc}"
        if key not in procedures_dict:
            procedures_dict[key] = {'technique_id': target_id, 'technique_name': target.get('name'), 'description': desc, 'campaigns': [], 'groups': [], 'tools': [], 'platforms': set()}

        # ИСПРАВЛЕНИЕ 1: Берем платформы СТРОГО из кампании, чтобы не тянуть Ичкерию из Актора "РФ"
        if source.get('type') == 'campaign' and "x_mitre_platforms" in source: 
            procedures_dict[key]['platforms'].update(source["x_mitre_platforms"])

        src_type = source.get('type')
        source_id = util.buildhelpers.get_attack_id(source) or ""
        source_name = source.get('name') or ""
        
        def add_unique(lst, item_id, item_name, raw_date=None):
            if not any(i['id'] == item_id for i in lst):
                obj = {'id': item_id, 'name': item_name}
                if raw_date is not None: obj['date'] = raw_date
                lst.append(obj)

        if src_type == 'campaign':
            fs = source.get('first_seen')
            add_unique(procedures_dict[key]['campaigns'], source_id, source_name, str(fs) if fs else "")
        elif src_type in ['intrusion-set', 'group']:
            add_unique(procedures_dict[key]['groups'], source_id, source_name)
        elif src_type in ['tool', 'malware']:
            add_unique(procedures_dict[key]['tools'], source_id, source_name)

    procedures_data = []
    for key, data in procedures_dict.items():
        data['platforms'] = ", ".join(sorted(data['platforms']))
        dates = [c['date'] for c in data['campaigns'] if c.get('date')]
        
        # ИСПРАВЛЕНИЕ 2: Железобетонный парсер дат
        if dates:
            earliest = str(min(dates))
            data['first_seen_raw'] = earliest
            
            match = re.search(r'(\d{4})-(\d{2})', earliest)
            if match:
                y, m = match.groups()
                months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                data['first_seen_display'] = f"{months[int(m)-1]} {y}"
            else:
                data['first_seen_display'] = earliest[:15]
        else:
            data['first_seen_raw'] = ""
            data['first_seen_display'] = "-"

        procedures_data.append(data)
        has_procedure = True

    if has_procedure:
        import json, os
        from . import procedures_config
        data = {"side_menu_data": {}, "procedures_table": procedures_data, "procedures_list_len": str(len(procedures_data))}
        subs = procedures_config.procedures_index_md + json.dumps(data)
        with open(os.path.join(procedures_config.procedures_markdown_path, "overview.md"), "w", encoding="utf8") as md_file:
            md_file.write(subs)
            
    return has_procedure