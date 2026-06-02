from . import faq, faq_config


def get_priority():
    return faq_config.priority


def get_menu():
    return {
        "display_name": "FAQ",
        "module_name": "FAQ",
        "url": "/resources/faq/",
        "external_link": False,
        "priority": faq_config.priority,
        "children": [],
    }


def run_module():
    return (faq.generate_faq(), faq_config.module_name)
