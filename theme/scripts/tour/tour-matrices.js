//is the user doing a tour of the entire site, or just this module?
let isSiteTour = window.location.href.includes("?tour=true");

//tour texts are generated into settings.js (tour_strings) from data/translations.json
function T(key) { return (typeof tour_strings != 'undefined' && tour_strings[key]) || key; }

//popover template: the cross in the top-right corner ends the tour (data-role='end'), bottom row keeps prev/next;
//on the last step, where there is no "next", the row shows the closing button instead.
//Looks (surface, type, buttons, icons) live in style-dc.css, section "подсказки экскурсии"; icons are CSS masks,
//because the popover sanitizer strips svg from the template.
let tourTemplate = "<div class='popover dc-tour' role='tooltip'><div class='arrow'></div>"
    + "<button class='dc-tour-x' data-role='end' aria-label='" + T("tour.btn.end") + "'></button>"
    + "<h3 class='popover-header'></h3><div class='popover-body'></div>"
    + "<div class='popover-navigation'>"
    + "<button class='dc-tour-prev' data-role='prev'>" + T("tour.btn.prev") + "</button>"
    + "<button class='dc-tour-next' data-role='next'>" + T("tour.btn.next") + "</button>"
    + "<button class='dc-tour-end' data-role='end'>" + T("tour.btn.end") + "</button>"
    + "</div></div>";

//step counter of a single-page tour: "2 / 4" next to the title, instead of the library's striped bar
function tourProgressText(i, percent, count) { return "<span class='dc-tour-n'>" + (i + 1) + " / " + count + "</span>"; }

function hide_prev_on_site_tour() { //the previous tour page is another module: "back" can not go there
    if (isSiteTour) $(".popover [data-role='prev']").hide();
}

//stubs: the matrix template wires these onto the highlighted example cell
function tour_technique_clicked() {}
function tour_layout_clicked() {}

//on a narrow screen the matrix is the same table scrolled sideways: two and a half columns are on screen,
//so the popovers point at the first column
let tourNarrow = window.matchMedia("(max-width: 767px)").matches;

//the matrix box scrolls sideways, and a popover is kept inside the scrolling box of its target:
//without this it could never stand above the matrix (Bootstrap reads the popover boundary from data-boundary)
$(".dc-mx-h").attr("data-boundary", "window");

let tourSteps = [
    {
        //the popover stands above the matrix and points at its header row instead of covering the matrix;
        //the matrix itself is too tall a target: the popover would land below it
        //the header row is rendered twice (inside the columns and as the sticky strip of a phone): take the shown one
        element: tourNarrow ? ".dc-mx-h:visible:first" : ".dc-mx-h:visible:eq(2)",
        placement: "top",
        backdrop: false,
        title: T("tour.matrices.intro.title"),
        content: T("tour.matrices.intro.content"),
        onShown: hide_prev_on_site_tour
    },
    {
        element: ".dc-mx-h:visible:first", //the whole header cell of the first tactic, not only its name
        placement: "bottom",
        backdrop: false,
        title: T("tour.matrices.tactics.title"),
        content: T("tour.matrices.tactics.content")
    },
    {
        element: ".dc-mx-t:first", //:first — popover attaches to EVERY matched element
        placement: tourNarrow ? "bottom" : "right",
        backdrop: false,
        title: T("tour.matrices.techniques.title"),
        content: T("tour.matrices.techniques.content")
    },
    {
        element: "#matrix-navigator-link",
        placement: "bottom",
        backdrop: false,
        title: T("tour.matrices.navigator.title"),
        content: T("tour.matrices.navigator.content")
    }
]

if (isSiteTour && typeof tour_steps['technique'] != 'undefined') tourSteps.push({
    onShow: function() { //go to the next tour module
        window.location.href = base_url + tour_steps['technique'] + "/?tour=true"
    }
})

let tour = new Tour({
    steps: tourSteps,
    container: "#tour-matrix-container",
    storage: false, //no resuming tour if the page is reloaded.
    framework: 'bootstrap4',   // set Tourist to use BS4 compatibility
    showProgressBar: false,
    showProgressText: !isSiteTour,
    getProgressTextHTML: tourProgressText,
    template: tourTemplate
})


function start_tour() {
    if (tour.ended()) tour.restart();
    else tour.start(true);
}

if (isSiteTour) {
    start_tour();
}
