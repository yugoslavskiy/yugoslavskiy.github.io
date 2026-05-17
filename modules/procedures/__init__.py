from . import procedures
from . import procedures_config

def get_priority():
    return procedures_config.priority

def get_menu():
    return {
        "display_name": "Процедуры",
        "module_name": procedures_config.module_name,
        "url": "/procedures/",
        "external_link": False,
        "priority": procedures_config.priority,
        "children": []
    }

def run_module():
    return (procedures.generate_procedures(), procedures_config.module_name)