/* Единый список процедур (см. macros/procedure_list.html): фильтры
   поиск/народы/диапазон лет/актор/инструмент + сортировка по дате.
   Все контролы опциональны — скрипт включает только найденные в root.
   Чекбоксы народов строит buildPeopleFilter (people-filter.js). */
function initProcedureList(root) {
    if (!root) return;
    const list = root.querySelector(".proc-list");
    const rows = Array.from(root.querySelectorAll(".procedure-row"));
    if (!list || !rows.length) return;

    const iSearch = root.querySelector(".pl-search");
    const selG = root.querySelector(".pl-group");
    const selT = root.querySelector(".pl-tool");
    const dMin = root.querySelector(".pl-date-min");
    const dMax = root.querySelector(".pl-date-max");
    const drFill = root.querySelector(".dr-fill");
    const platformContainer = root.querySelector(".people-filter-box");

    // народы: при одном народе фильтр не показываем
    let pf = null;
    if (platformContainer) {
        pf = buildPeopleFilter(platformContainer, rows, applyFilters);
        if (pf.size < 2) {
            const wrap = platformContainer.closest(".col-md-12");
            if (wrap) wrap.style.display = "none";
            pf = null;
        }
    }

    // диапазон лет: прячем блок, если все процедуры одного года или без дат
    let minY = 0, maxY = 0, datesOn = false;
    if (dMin && dMax) {
        const years = rows.map(function (r) { return parseInt((r.dataset.date || "").slice(0, 4)); }).filter(function (y) { return !isNaN(y); });
        minY = years.length ? Math.min.apply(null, years) : 0;
        maxY = years.length ? Math.max.apply(null, years) : 0;
        if (minY < maxY) {
            datesOn = true;
            [dMin, dMax].forEach(function (s) { s.min = minY; s.max = maxY; s.step = 1; });
            dMin.value = minY;
            dMax.value = maxY;
            dMin.addEventListener("input", updDate);
            dMax.addEventListener("input", updDate);
            updDate();
        } else {
            const wrap = dMin.closest(".col-md-12");
            if (wrap) wrap.style.display = "none";
        }
    }

    function updDate(e) {
        let lo = +dMin.value, hi = +dMax.value;
        if (lo > hi) {
            if (e && e.target === dMin) { dMax.value = lo; hi = lo; }
            else { dMin.value = hi; lo = hi; }
        }
        const outMin = root.querySelector(".pl-dmin-out");
        const outMax = root.querySelector(".pl-dmax-out");
        if (outMin) outMin.textContent = lo;
        if (outMax) outMax.textContent = hi;
        if (drFill) {
            const range = (maxY - minY) || 1;
            drFill.style.left = ((lo - minY) / range * 100) + "%";
            drFill.style.width = ((hi - lo) / range * 100) + "%";
        }
        applyFilters();
    }

    function applyFilters() {
        const q = iSearch ? iSearch.value.toLowerCase() : "";
        const checked = pf ? pf.checked() : null;
        const g = selG ? selG.value : "";
        const t = selT ? selT.value : "";
        const lo = datesOn ? +dMin.value : null;
        const hi = datesOn ? +dMax.value : null;
        rows.forEach(function (row) {
            const textMatch = !q || row.dataset.search.includes(q);
            let platMatch = true;
            if (checked) {
                const plats = (row.dataset.platforms || "").toLowerCase().split(",").map(function (p) { return p.trim(); }).filter(Boolean);
                platMatch = !plats.length || plats.some(function (p) { return checked.includes(p); });
            }
            const groupMatch = !g || (row.dataset.groups || "").split(",").includes(g);
            const toolMatch = !t || (row.dataset.tools || "").split(",").includes(t);
            let dateMatch = true;
            if (datesOn) {
                const yr = parseInt((row.dataset.date || "").slice(0, 4));
                dateMatch = isNaN(yr) || (yr >= lo && yr <= hi);
            }
            row.classList.toggle("proc-hidden", !(textMatch && platMatch && groupMatch && toolMatch && dateMatch));
        });
    }

    if (iSearch) iSearch.addEventListener("input", applyFilters);
    if (selG) selG.addEventListener("change", applyFilters);
    if (selT) selT.addEventListener("change", applyFilters);

    // сортировка по дате первой кампании; без дат — всегда в конце
    const sortBtn = root.querySelector(".pl-sort");
    if (sortBtn) {
        const sortLabel = sortBtn.querySelector(".pl-sort-label");
        const sortIcon = sortBtn.querySelector(".pl-sort-icon");
        let sortAsc = (root.dataset.sortDefault || "newest") === "oldest";
        function applySort() {
            rows.slice().sort(function (a, b) {
                const dA = a.dataset.date || "", dB = b.dataset.date || "";
                if (dA === dB) return 0;
                if (!dA) return 1;
                if (!dB) return -1;
                return sortAsc ? (dA > dB ? 1 : -1) : (dA < dB ? 1 : -1);
            }).forEach(function (r) { list.appendChild(r); });
            if (sortLabel) sortLabel.textContent = sortAsc ? sortBtn.dataset.oldest : sortBtn.dataset.newest;
            if (sortIcon) sortIcon.innerHTML = sortAsc ? "&#8593;" : "&#8595;";
        }
        sortBtn.addEventListener("click", function () { sortAsc = !sortAsc; applySort(); });
        applySort();
    }
}
