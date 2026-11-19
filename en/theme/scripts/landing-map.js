// Карта империи на главной: выбор шага по году, один автопрогон от первого шага до последнего,
// условные знаки и описание шага. Данные шагов лежат в атрибутах кнопок лет.
// В страницу записана копия шагов на день сборки. При открытии скрипт берёт свежий файл шагов
// с сайта карты (data-src) и перерисовывает блок, если отпечаток файла (stamp) не тот, что у копии.
// Файл не пришёл или не прошёл проверку - остаётся копия.
(function () {
    var SVG = 'http://www.w3.org/2000/svg', FORMAT = 1;
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    Array.prototype.forEach.call(document.querySelectorAll('[data-emp]'), function (root) {
        var svg = root.querySelector('.emp-svg'), bord = root.querySelector('.emp-bord');
        var steps = root.querySelectorAll('.emp-step'), years = root.querySelectorAll('.emp-y');
        var year = root.querySelector('.emp-year'), area = root.querySelector('.emp-area');
        var legend = root.querySelectorAll('.emp-legend li'), text = root.querySelector('.emp-text');
        var more = root.querySelector('.emp-more'), play = root.querySelector('.emp-play'), strip = root.querySelector('.emp-years');
        var lang = root.getAttribute('data-lang') || 'ru';
        var current = years.length - 1, timer = null;
        var fresh = null;                       // свежие шаги, которые ждут конца прогона
        var settled = false, wantRun = false;   // автопрогон ждёт ответа сайта карты, но недолго

        function show(i) {
            current = i;
            for (var k = 0; k < steps.length; k++) {
                steps[k].classList.toggle('on', k === i);
                years[k].setAttribute('aria-pressed', k === i ? 'true' : 'false');
            }
            var data = years[i].dataset, keys = data.keys.split(' ');
            year.textContent = years[i].textContent;
            area.textContent = data.area;
            for (k = 0; k < legend.length; k++) legend[k].hidden = keys.indexOf(legend[k].getAttribute('data-k')) < 0;
            text.textContent = '';
            var date = document.createElement('b');
            date.textContent = data.date + '. ';
            text.appendChild(date);
            text.appendChild(document.createTextNode(data.text));
            // узкий экран: ряд лет прокручивается, выбранный год - по центру; страницу не двигаем
            if (strip.scrollWidth > strip.clientWidth) strip.scrollLeft = years[i].offsetLeft - strip.offsetLeft - (strip.clientWidth - years[i].offsetWidth) / 2;
            edges();
        }

        // край ряда лет затухает только там, где ряд продолжается
        function edges() {
            var rest = strip.scrollWidth - strip.clientWidth, x = strip.scrollLeft;
            strip.style.setProperty('--fl', x > 1 ? '28px' : '0px');
            strip.style.setProperty('--fr', rest - x > 1 ? '28px' : '0px');
        }

        function mark(running) {
            var label = running ? play.dataset.stop : play.dataset.play;
            play.classList.toggle('run', running);
            play.setAttribute('aria-label', label);
            play.title = label;
        }

        function stop() {
            wantRun = false;
            if (timer) { clearInterval(timer); timer = null; }
            mark(false);
            if (fresh) setTimeout(apply, 0);   // после того, как обработчик покажет выбранный шаг
        }

        function start() {
            if (more.getAttribute('aria-expanded') === 'true') more.click();   // на прогоне описание не прочитать
            show(0);
            mark(true);
            timer = setInterval(function () {
                if (current >= years.length - 1) return stop();
                show(current + 1);
                if (current >= years.length - 1) stop();
            }, 1300);
        }

        // ---------- свежие шаги с сайта карты ----------
        function local(texts) { return (texts && (texts[lang] || texts.ru)) || ''; }

        function str(v) { return typeof v === 'string'; }

        function valid(m) {
            if (!m || m.v !== FORMAT || !(m.w > 0) || !(m.h > 0) || !str(m.stamp)) return false;
            if (!str(m.land) || !m.land || !str(m.borders) || !str(m.grat) || !m.legend) return false;
            if (!m.steps || !(m.steps.length >= 2)) return false;
            for (var i = 0; i < m.steps.length; i++) {
                var s = m.steps[i];
                if (!s || !str(s.year) || !str(s.red) || !s.red || !str(s.pale) || !str(s.dots)) return false;
                if (!local(s.date) || !local(s.area) || !local(s.text)) return false;
            }
            return true;
        }

        function path(cls, d) {
            var p = document.createElementNS(SVG, 'path');
            p.setAttribute('class', cls);
            p.setAttribute('d', d);
            return p;
        }

        function redraw(m) {
            // число шагов прежнее - читатель остаётся на своём шаге, иначе на последнем
            var keep = m.steps.length === years.length ? current : m.steps.length - 1;
            var focused = strip.contains(document.activeElement), k;
            svg.setAttribute('viewBox', '0 0 ' + m.w + ' ' + m.h);
            root.querySelector('.emp-grat').setAttribute('d', m.grat);
            root.querySelector('.emp-land').setAttribute('d', m.land);
            bord.setAttribute('d', m.borders);
            for (k = 0; k < steps.length; k++) svg.removeChild(steps[k]);
            while (strip.firstChild) strip.removeChild(strip.firstChild);
            m.steps.forEach(function (s, i) {
                var g = document.createElementNS(SVG, 'g'), keys = ['red'];
                g.setAttribute('class', i === keep ? 'emp-step on' : 'emp-step');   // без затухания и проявления
                if (s.pale) { g.appendChild(path('emp-pale', s.pale)); keys.push('pale'); }
                g.appendChild(path('emp-red', s.red));
                if (s.dots) { g.appendChild(path('emp-dot0', s.dots)); g.appendChild(path('emp-dot', s.dots)); keys.push('dot'); }
                svg.insertBefore(g, bord);
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'emp-y';
                b.setAttribute('aria-pressed', 'false');
                b.setAttribute('data-keys', keys.join(' '));
                b.setAttribute('data-area', local(s.area));
                b.setAttribute('data-date', local(s.date));
                b.setAttribute('data-text', local(s.text));
                b.textContent = s.year;
                strip.appendChild(b);
            });
            strip.style.setProperty('--emp-n', m.steps.length);
            var total = 0;
            for (k = 0; k < legend.length; k++) {
                var label = local(m.legend[legend[k].getAttribute('data-k')]);
                if (label) {
                    while (legend[k].lastChild && legend[k].lastChild.nodeType === 3) legend[k].removeChild(legend[k].lastChild);
                    legend[k].appendChild(document.createTextNode(label));
                }
                total += legend[k].textContent.length;
            }
            root.classList.toggle('emp--wrap', total > 78);   // три знака и ссылка «Описание» в одну строку не помещаются
            root.setAttribute('data-stamp', m.stamp);
            steps = root.querySelectorAll('.emp-step');
            years = root.querySelectorAll('.emp-y');
            show(keep);
            if (focused) years[keep].focus();
        }

        function apply() {
            if (!fresh || timer) return;
            var m = fresh;
            fresh = null;
            redraw(m);
        }

        // ответ пришёл или ждать больше нечего: можно начинать отложенный автопрогон
        function settle() {
            if (settled) return;
            settled = true;
            apply();
            if (wantRun) { wantRun = false; start(); }
        }

        play.addEventListener('click', function () { if (timer) stop(); else start(); });
        strip.addEventListener('click', function (e) {
            var i = Array.prototype.indexOf.call(years, e.target);
            if (i < 0) return;
            stop();
            show(i);
        });
        strip.addEventListener('keydown', function (e) {
            var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
            if (!d || current + d < 0 || current + d >= years.length) return;
            stop();
            show(current + d);
            years[current].focus();
            e.preventDefault();
        });
        strip.addEventListener('scroll', edges, { passive: true });
        window.addEventListener('resize', edges);
        more.addEventListener('click', function () {
            var open = more.getAttribute('aria-expanded') !== 'true';
            if (open) stop();
            more.setAttribute('aria-expanded', open ? 'true' : 'false');
            text.hidden = !open;
        });
        // экскурсия открывает подсказку поверх карты: прогон на паузу
        var tour = document.getElementById('tour-start');
        if (tour) tour.addEventListener('click', stop);

        show(current);

        var src = root.getAttribute('data-src');
        if (src && window.fetch) {
            var ctl = window.AbortController ? new AbortController() : null;
            setTimeout(settle, 1200);                                        // медленную сеть автопрогон не ждёт
            setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
            fetch(src, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctl ? ctl.signal : undefined })
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (m) {
                    if (valid(m) && m.stamp !== root.getAttribute('data-stamp')) { fresh = m; apply(); }
                    settle();
                })
                .catch(settle);
        } else {
            settle();
        }

        // один прогон сам, когда карта первый раз хотя бы наполовину на экране
        if (!calm && 'IntersectionObserver' in window) {
            var seen = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    seen.disconnect();
                    setTimeout(function () { if (settled) start(); else wantRun = true; }, 700);
                }
            }, { threshold: 0.5 });
            seen.observe(root.querySelector('.emp-panel'));
        }
    });
})();
