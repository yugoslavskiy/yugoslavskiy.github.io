/* Чекбоксы «Фильтр по народам» — общий строитель для страниц техник,
   процедур и кампаний. Собирает уникальные народы из data-platforms
   переданных строк, рисует чекбоксы в контейнер и подписывает onChange.

   Возвращает { size, checked() }:
     size      — число народов (0/1 — фильтр можно не показывать),
     checked() — выбранные народы (lowercase). */
function buildPeopleFilter(container, rows, onChange, checkboxClass) {
    const cls = checkboxClass || "plat-checkbox";
    const set = new Set();
    rows.forEach(function (r) {
        (r.dataset.platforms || "").split(",").forEach(function (p) {
            if (p.trim()) set.add(p.trim());
        });
    });
    set.forEach(function (p) {
        const span = document.createElement("span");
        span.innerHTML = '<input class="' + cls + '" type="checkbox" value="' + p.toLowerCase() + '" id="' + cls + "-" + p + '" checked> ' +
                         '<label for="' + cls + "-" + p + '">' + p + "</label>";
        container.appendChild(span);
    });
    if (onChange) container.addEventListener("change", onChange);
    return {
        size: set.size,
        checked: function () {
            return Array.from(container.querySelectorAll("input:checked")).map(function (cb) { return cb.value; });
        }
    };
}
