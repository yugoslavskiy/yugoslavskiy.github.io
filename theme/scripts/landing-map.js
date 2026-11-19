// Карта империи на главной: выбор шага по году, один автопрогон от первого шага до последнего,
// условные знаки и описание шага. Данные шагов лежат в атрибутах кнопок лет.
(function () {
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    Array.prototype.forEach.call(document.querySelectorAll('[data-emp]'), function (root) {
        var steps = root.querySelectorAll('.emp-step'), years = root.querySelectorAll('.emp-y');
        var year = root.querySelector('.emp-year'), area = root.querySelector('.emp-area');
        var legend = root.querySelectorAll('.emp-legend li'), text = root.querySelector('.emp-text');
        var more = root.querySelector('.emp-more'), play = root.querySelector('.emp-play'), strip = root.querySelector('.emp-years');
        var current = years.length - 1, timer = null;

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
            if (timer) { clearInterval(timer); timer = null; }
            mark(false);
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

        play.addEventListener('click', function () { if (timer) stop(); else start(); });
        Array.prototype.forEach.call(years, function (button, i) {
            button.addEventListener('click', function () { stop(); show(i); });
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
        // один прогон сам, когда карта первый раз хотя бы наполовину на экране
        if (!calm && 'IntersectionObserver' in window) {
            var seen = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) { seen.disconnect(); setTimeout(start, 700); }
            }, { threshold: 0.5 });
            seen.observe(root.querySelector('.emp-panel'));
        }
    });
})();
