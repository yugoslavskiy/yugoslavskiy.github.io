import json
import math
import os

from modules import site_config, util
from loguru import logger

from . import faq_config

#{"display_name": "FAQ", "url": "/resources/faq/", "external_link": False, "children": []},

def generate_faq():
    """Generate FAQ page markdown."""

    """Responsible for compiling faq json into faq markdown file for rendering on the HMTL."""
    logger.info("Generating FAQ page")

    # Create content pages directory if does not already exist
    util.buildhelpers.create_content_pages_dir()

    # load faq data from json
    with open(os.path.join(site_config.data_directory, "faq.json"), "r", encoding="utf8") as f:
        faqdata = json.load(f)

    # add unique IDs
    for i, section in enumerate(faqdata["sections"]):
        for j, item in enumerate(section["questions"]):
            item["id"] = f"faq-{i}-{j}"
    # get markdown
    faq_content = faq_config.faq_md + json.dumps(faqdata)

    # Create directory if it does not exist
    if not os.path.isdir(faq_config.faq_markdown_path):
        os.mkdir(faq_config.faq_markdown_path)

    # write markdown to file
    with open(os.path.join(site_config.resources_markdown_path, "faq.md"), "w", encoding="utf8") as md_file:
        md_file.write(faq_content)

