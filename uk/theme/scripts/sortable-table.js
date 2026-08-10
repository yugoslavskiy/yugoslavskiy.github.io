/* Сортируемые индексные таблицы (class="js-sortable"): клик по заголовку
   сортирует строки по колонке, повторный клик меняет направление.
   Значение ячейки — data-sort (сырые даты и т.п.), иначе текст; числа
   сравниваются как числа; пустые значения — всегда в конце. */
(function () {
    function cellValue(row, idx) {
        const td = row.children[idx];
        if (!td) return "";
        return td.dataset.sort !== undefined ? td.dataset.sort : td.textContent.trim();
    }

    function initSortableTable(table) {
        const tbody = table.tBodies[0];
        if (!tbody || !table.tHead || !table.tHead.rows.length) return;
        const ths = Array.from(table.tHead.rows[0].cells);
        ths.forEach(function (th, idx) {
            th.addEventListener("click", function () {
                const asc = !th.classList.contains("sorted-asc");
                ths.forEach(function (t) { t.classList.remove("sorted-asc", "sorted-desc"); });
                th.classList.add(asc ? "sorted-asc" : "sorted-desc");

                const numRe = /^-?\d+([.,]\d+)?$/;
                Array.from(tbody.rows).sort(function (a, b) {
                    const va = cellValue(a, idx), vb = cellValue(b, idx);
                    if (va === "" && vb === "") return 0;
                    if (va === "") return 1;    // пустые — в конец при любом направлении
                    if (vb === "") return -1;
                    let cmp;
                    if (numRe.test(va) && numRe.test(vb)) {
                        cmp = parseFloat(va.replace(",", ".")) - parseFloat(vb.replace(",", "."));
                    } else {
                        cmp = va.localeCompare(vb, undefined, { sensitivity: "base" });
                    }
                    return asc ? cmp : -cmp;
                }).forEach(function (r) { tbody.appendChild(r); });
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("table.js-sortable").forEach(initSortableTable);
    });
})();
