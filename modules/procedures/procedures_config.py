from string import Template

module_name = "Procedures"
priority = 4.1  # Запустится сразу после техник (4)

# Путь, куда генератор сложит готовый markdown
procedures_markdown_path = "content/pages/procedures/"

# Заголовок для Pelican
procedures_index_md = (
    "Title: Procedures overview\nTemplate: procedures/procedures-index\nsave_as: procedures/index.html\ndata: "
)

# Откуда брать HTML шаблоны
procedures_templates_path = "modules/procedures/templates/"